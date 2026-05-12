import type { Minion } from '@overlay/shared';

// Weight per matching tribe member already on board
const TRIBE_BONUS_WEIGHT = 0.15;
const MAX_SCORE = 1.0;

export function tribeSynergyScore(board: Minion[], candidate: Minion): number {
  if (candidate.tribes.length === 0) return 0;

  let matches = 0;
  for (const boardMinion of board) {
    for (const tribe of candidate.tribes) {
      if (boardMinion.tribes.includes(tribe)) {
        matches++;
        break; // count each board minion at most once
      }
    }
  }

  return Math.min(MAX_SCORE, matches * TRIBE_BONUS_WEIGHT);
}
