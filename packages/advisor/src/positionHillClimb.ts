import type { Board, OpponentState, PlayerState } from '@overlay/shared';
import { scoreCandidate } from './simScorer';
import type { ScoreResult } from './simScorer';

export interface PositionResult {
  bestOrder: number[];
  bestScore: ScoreResult;
}

/**
 * Hill-climb the best minion ordering on the board.
 *
 * Starts with the current ordering, then tries all single swaps.
 * If a swap improves the score (winPct), it's accepted. Repeats
 * until no single swap improves the score or `maxSwaps` iterations
 * are done.
 *
 * Uses `scoreCandidate` with real simulation when `n > 0`.
 * With `n=0` or no active opponents, returns the current ordering.
 */
export function hillClimbPosition(
  board: Board,
  playerState: PlayerState,
  opponents: OpponentState[],
  n: number,
  maxSwaps = 20,
): PositionResult {
  const minionCount = board.minions.length;

  // Nothing to reorder
  if (minionCount <= 1) {
    return {
      bestOrder: [...board.minions.map((_, i) => i)],
      bestScore: { winPct: 0, avgHpDelta: 0 },
    };
  }

  // No active opponents and no sims — return current order as-is
  const activeOpponents = opponents.filter((o) => !o.eliminated);
  if (n === 0 || activeOpponents.length === 0) {
    return {
      bestOrder: [...board.minions.map((_, i) => i)],
      bestScore: { winPct: 0, avgHpDelta: 0 },
    };
  }

  // Build the reordered board for scoring
  function reorderBoard(indices: number[]): Board {
    const minions: Board['minions'] = [];
    for (let k = 0; k < indices.length; k++) {
      const idx = board.minions[indices[k] as number];
      if (idx) minions.push(idx);
    }
    return { minions };
  }

  // Current ordering
  const bestOrder: number[] = [];
  for (let i = 0; i < minionCount; i++) {
    bestOrder.push(i);
  }
  let bestScore = scoreCandidate(reorderBoard(bestOrder), playerState, activeOpponents, n);

  let improved = true;
  let iterations = 0;

  while (improved && iterations < maxSwaps) {
    improved = false;
    iterations++;

    for (let i = 0; i < minionCount; i++) {
      for (let j = i + 1; j < minionCount; j++) {
        // Try swapping indices i and j
        const candidateOrder: number[] = [];
        for (let k = 0; k < minionCount; k++) {
          candidateOrder.push(bestOrder[k] as number);
        }
        const temp = candidateOrder[i] as number;
        candidateOrder[i] = candidateOrder[j] as number;
        candidateOrder[j] = temp;

        const candidateScore = scoreCandidate(
          reorderBoard(candidateOrder),
          playerState,
          activeOpponents,
          n,
        );

        // Accept swap if winPct is strictly better
        if (candidateScore.winPct > bestScore.winPct) {
          // Replace bestOrder contents
          for (let k = 0; k < minionCount; k++) {
            bestOrder[k] = candidateOrder[k] as number;
          }
          bestScore = candidateScore;
          improved = true;
        }
      }
    }
  }

  return { bestOrder, bestScore };
}
