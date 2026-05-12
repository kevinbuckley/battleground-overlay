import type { FreezeAction, GameState } from '@overlay/shared';
import { freezeScore } from './freezeScore';
import { tribeSynergyScore } from './tribeSynergy';
import { tripleScore } from './triple';

// Returns a FreezeAction for the best shop minion to freeze, or null
// if freezing is not recommended (score too low or shop is empty).
export function freezeMinion(state: GameState): FreezeAction | null {
  const { player } = state;
  const shopMinions = player.shop.minions;

  if (shopMinions.length === 0) return null;

  const overallScore = freezeScore(state);
  if (overallScore < 0.5) return null;

  // Pick the shop minion with the highest freeze value:
  // weighted combination of triple opportunity + tribe synergy.
  let bestValue = Number.NEGATIVE_INFINITY;

  const boardMinions = player.board.minions;

  for (const shopCard of shopMinions) {
    const t = tripleScore(shopCard, boardMinions);
    const s = tribeSynergyScore(boardMinions, shopCard);
    const value = t * 0.6 + s * 0.4;

    if (value > bestValue) {
      bestValue = value;
    }
  }

  return { type: 'Freeze' };
}
