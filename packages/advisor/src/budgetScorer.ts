import type { GameState, Recommendation } from '@overlay/shared';
import { enumerateBuyCandidates } from './candidates';
import { scoreCandidate } from './simScorer';
import { withBudget } from './withBudget';

const TOP_N = 3;

/**
 * Score all shop buy candidates via simulation with a time budget.
 *
 * For each shop minion, enumerates buy candidates, scores each via
 * `scoreCandidate` wrapped in `withBudget`, and returns the top N
 * sorted by winPct.
 *
 * When n=0 (no simulations), returns recommendations with score 0
 * so the heuristic path can still produce output.
 */
export function scoreBuysWithSim(state: GameState, n: number, budgetMs: number): Recommendation[] {
  const candidates = enumerateBuyCandidates(state);
  const { player, opponents } = state;

  const scored: Recommendation[] = candidates.map((c) => {
    const result = withBudget(
      () => scoreCandidate(c.projectedBoard, player, opponents, n),
      budgetMs,
      { winPct: 0, avgHpDelta: 0 },
    );

    return {
      action: c.action,
      score: result.winPct,
      confidence: Math.min(1, result.winPct + 0.05),
      reason:
        result.winPct > 0.5
          ? 'projected win rate above 50%'
          : result.winPct > 0
            ? 'projected win rate below 50%'
            : 'no simulation data',
    };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, TOP_N);
}
