import type { GameState } from '@overlay/shared';
import { tribeSynergyScore } from './tribeSynergy';
import { tripleScore } from './triple';

// Returns a reroll score in [0, 1].
// High score = good time to reroll the shop.
// Criteria:
//   1. No shop minion has meaningful triple potential (all tripleScore < 0.4).
//   2. No shop minion has meaningful tribe synergy with the player's board.
//   3. Player HP is safe (>= 15).
//   4. Player has enough gold to afford a reroll (gold >= rollCost).

export function rerollScore(state: GameState): number {
  const { shop, gold, hero } = state.player;
  if (shop.minions.length === 0) return 0;

  // 1. Check triple potential across all shop minions
  let maxTriple = 0;
  for (const shopMinion of shop.minions) {
    const ts = tripleScore(shopMinion, state.player.board.minions);
    if (ts > maxTriple) maxTriple = ts;
  }
  // If any shop card has triple potential (>= 0.4), don't reroll
  if (maxTriple >= 0.4) return 0;

  // 2. Check tribe synergy across all shop minions
  let maxSynergy = 0;
  for (const shopMinion of shop.minions) {
    const ss = tribeSynergyScore(state.player.board.minions, shopMinion);
    if (ss > maxSynergy) maxSynergy = ss;
  }
  // If any shop card has meaningful synergy (>= 0.5), don't reroll
  if (maxSynergy >= 0.5) return 0;

  // 3. HP safety: player needs at least 15 hp to reroll safely
  if (hero.hp < 15) return 0;

  // 4. Can afford a reroll
  if (gold < shop.rollCost) return 0;

  // All conditions met: good time to reroll
  return 1.0;
}
