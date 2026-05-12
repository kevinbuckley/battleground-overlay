import type { GameState } from '@overlay/shared';

/**
 * Produce a stable hash string from a GameState for cache deduplication.
 * Only the fields that affect LLM output are included: turn, phase,
 * player (tier, hp, gold, board minion ids), and opponents (tier, hp).
 */
export function hashState(state: GameState): string {
  const playerBoard = state.player.board.minions
    .map((m) => `${m.entityId}:${m.cardId}`)
    .sort()
    .join(',');

  const opponentInfo = state.opponents
    .filter((o) => !o.eliminated)
    .map((o) => `${o.playerId}:${o.tier}:${o.hero.hp}`)
    .sort()
    .join(';');

  const payload = JSON.stringify({
    turn: state.turn,
    phase: state.phase,
    playerTier: state.player.tier,
    playerHp: state.player.hero.hp,
    playerGold: state.player.gold,
    playerBoard: playerBoard,
    opponents: opponentInfo,
  });

  return hashString(payload);
}

/**
 * Simple deterministic hash: djb2 over the input string.
 */
function hashString(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) | 0;
  }
  return hash.toString(36);
}

const MAX_ENTRIES = 50;

export class LlmCache {
  private store: Map<string, string>;

  constructor() {
    this.store = new Map();
  }

  get(state: GameState): string | undefined {
    const key = hashState(state);
    const value = this.store.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.store.delete(key);
      this.store.set(key, value);
    }
    return value;
  }

  set(state: GameState, result: string): void {
    const key = hashState(state);
    if (this.store.has(key)) {
      this.store.delete(key);
    } else if (this.store.size >= MAX_ENTRIES) {
      // Evict oldest (first entry)
      const oldestKey = this.store.keys().next().value;
      if (oldestKey !== undefined) {
        this.store.delete(oldestKey);
      }
    }
    this.store.set(key, result);
  }

  clear(): void {
    this.store.clear();
  }

  get size(): number {
    return this.store.size;
  }
}
