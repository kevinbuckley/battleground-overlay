import type { GameState, Minion } from '@overlay/shared';

// Returns a sell score in [0, 1].
// High score = good minion to sell.
// Criteria:
//   1. Is the weakest minion on the board (by combined attack+health)?
//   2. Has zero tribe synergy with the rest of the board?
//   3. Is NOT part of a triple-in-progress (i.e. selling it wouldn't
//      break a triple, and buying it wouldn't create one)?

export function sellScore(minion: Minion, board: Minion[], _state: GameState): number {
  if (minion.golden) return 0;

  const allMinions = board;
  if (allMinions.length < 7) return 0;

  // 1. Weakest by combined stats
  let weakestIdx = 0;
  let weakestScore = Number.POSITIVE_INFINITY;
  for (let i = 0; i < allMinions.length; i++) {
    const minionEntry = allMinions[i];
    if (!minionEntry) continue;
    const combined = minionEntry.attack + minionEntry.health;
    if (combined < weakestScore) {
      weakestScore = combined;
      weakestIdx = i;
    }
  }
  const weakestEntry = allMinions[weakestIdx];
  if (!weakestEntry) return 0;
  const isWeakest = weakestEntry.entityId === minion.entityId;

  // 2. Zero synergy with remaining board (excluding self)
  const remaining = allMinions.filter((m) => m.entityId !== minion.entityId);
  let hasSynergy = false;
  for (const other of remaining) {
    for (const tribe of minion.tribes) {
      if (other.tribes.includes(tribe)) {
        hasSynergy = true;
        break;
      }
    }
    if (hasSynergy) break;
  }

  // 3. Not a triple-in-progress: check if this minion has 2 copies
  //    already on board (selling it would destroy a triple opportunity)
  const copiesOnBoard = allMinions.filter(
    (m) => m.entityId !== minion.entityId && m.cardId === minion.cardId,
  ).length;
  const isTripleInprogress = copiesOnBoard >= 2;

  // Score: high when weakest + no synergy + not triple-in-progress
  let score = 0;
  if (isWeakest) score += 0.4;
  if (!hasSynergy) score += 0.4;
  if (!isTripleInprogress) score += 0.2;

  return Math.min(1.0, score);
}
