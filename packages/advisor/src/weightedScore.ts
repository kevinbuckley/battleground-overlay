import type { ScoreResult } from './simScorer';

/**
 * Compute a weighted win score from a ScoreResult.
 *
 * Multiplies each opponent's winPct by the corresponding lobby weight
 * and sums. The result is a single number in [0, 1] representing the
 * expected win probability across the entire lobby.
 *
 * @param scoreResult — aggregated ScoreResult from scoreCandidate
 * @param weights — per-opponent weights (same length as opponents list
 *   that produced scoreResult); use `lobbyWeights(opponents)` to get
 *   these
 */
export function weightedWinScore(scoreResult: ScoreResult, weights: number[]): number {
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  if (totalWeight === 0) return 0;
  return scoreResult.winPct * totalWeight;
}
