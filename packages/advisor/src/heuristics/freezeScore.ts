import type { GameState } from '@overlay/shared';
import { tribeSynergyScore } from './tribeSynergy';
import { tripleScore } from './triple';

// Returns a freeze score in [0, 1].
// High score = good time to freeze (don't reroll).
// Criteria:
//   1. Does the shop contain a card that would create a triple?
//   2. Does the shop contain a card with strong tribe synergy?
//   3. Is the player's HP safe (not in danger of dying next turn)?
//
// A freeze is recommended when the shop is good AND the player
// can afford to wait (hp is safe).

// Threshold for "safe hp": player has enough hp to survive one more
// opponent turn even taking moderate damage.
const SAFE_HP_THRESHOLD = 6;

export function freezeScore(state: GameState): number {
  const { player } = state;

  if (player.shop.frozen) return 0;

  const shopMinions = player.shop.minions;
  const boardMinions = player.board.minions;

  if (shopMinions.length === 0) return 0;

  // 1. Triple opportunity: does any shop minion create a triple?
  let maxTriple = 0;
  for (const shopCard of shopMinions) {
    const t = tripleScore(shopCard, boardMinions);
    if (t > maxTriple) maxTriple = t;
  }

  // 2. Tribe synergy: does any shop minion have strong tribe synergy?
  let maxSynergy = 0;
  for (const shopCard of shopMinions) {
    const s = tribeSynergyScore(boardMinions, shopCard);
    if (s > maxSynergy) maxSynergy = s;
  }

  // 3. HP safety: is the player's hp above the safe threshold?
  const hpSafe = player.hero.hp >= SAFE_HP_THRESHOLD;

  // Score: high when triple opportunity OR strong synergy AND hp is safe
  let score = 0;

  if (maxTriple > 0 && hpSafe) {
    score += 0.5;
  }
  if (maxSynergy > 0 && hpSafe) {
    score += 0.3;
  }
  if (hpSafe) {
    score += 0.2;
  }

  return Math.min(1.0, score);
}
