import { describe, expect, it } from 'bun:test';
import {
  clearOpponentPanel,
  getOpponentPanel,
  getWorstThreat,
  setOpponentPanel,
} from './opponentPanel';
import type { OpponentState } from './state';

function makeOpponent(opts: Partial<OpponentState> & { boardMinions: number }): OpponentState {
  return {
    entityId: opts.entityId ?? 0,
    playerId: opts.playerId ?? 0,
    hero: opts.hero ?? { hp: 30, cardId: 'Hero_1', entityId: 0, armor: 0 },
    board: {
      minions: Array(opts.boardMinions)
        .fill(null)
        .map((_, i) => ({
          entityId: i,
          cardId: 'TestMinion',
          attack: 1,
          health: 1,
          taunt: false,
          divineShield: false,
          poisonous: false,
          windfury: false,
          cleave: false,
          golden: false,
          reborn: false,
          frozen: false,
          tribes: [],
        })),
    },
    tier: opts.tier ?? 1,
    eliminated: opts.eliminated ?? false,
  };
}

describe('getWorstThreat', () => {
  it('returns null for empty array', () => {
    expect(getWorstThreat([])).toBeNull();
  });

  it('returns null when all opponents are eliminated', () => {
    const opponents: OpponentState[] = [
      makeOpponent({ entityId: 1, boardMinions: 3, eliminated: true }),
      makeOpponent({ entityId: 2, boardMinions: 5, eliminated: true }),
    ];
    expect(getWorstThreat(opponents)).toBeNull();
  });

  it('returns the opponent with the most board minions', () => {
    const opponents: OpponentState[] = [
      makeOpponent({ entityId: 1, boardMinions: 2 }),
      makeOpponent({ entityId: 2, boardMinions: 5 }),
      makeOpponent({ entityId: 3, boardMinions: 3 }),
    ];
    const result = getWorstThreat(opponents);
    if (result === null) {
      throw new Error('expected non-null');
    }
    expect(result.entityId).toBe(2);
  });

  it('returns first opponent on tie (highest minion count)', () => {
    const opponents: OpponentState[] = [
      makeOpponent({ entityId: 1, boardMinions: 4 }),
      makeOpponent({ entityId: 2, boardMinions: 4 }),
    ];
    const result = getWorstThreat(opponents);
    if (result === null) {
      throw new Error('expected non-null');
    }
    expect(result.entityId).toBe(1);
  });

  it('setOpponentPanel with 2 opponents then getOpponentPanel returns length 2', () => {
    const opponents: OpponentState[] = [
      makeOpponent({ entityId: 1, boardMinions: 2 }),
      makeOpponent({ entityId: 2, boardMinions: 3 }),
    ];
    setOpponentPanel({ opponents });
    const panel = getOpponentPanel();
    expect(panel.opponents.length).toBe(2);
  });

  it('clearOpponentPanel then getOpponentPanel returns empty', () => {
    setOpponentPanel({ opponents: [makeOpponent({ entityId: 1, boardMinions: 1 })] });
    clearOpponentPanel();
    const panel = getOpponentPanel();
    expect(panel.opponents.length).toBe(0);
  });
});
