import type { GameState, Recommendation } from '@overlay/shared';
import {
  enumerateBuyCandidates,
  enumerateFreezeCandidates,
  enumerateRerollCandidates,
  enumerateSellCandidates,
  enumerateTierUpCandidates,
} from './candidates';
import { predictOpponentBoard } from './opponentPredictor';
import { scoreCandidate, scoreSellCandidate } from './simScorer';
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
  const { player, opponents, turn } = state;

  const projectedOpponents = opponents.map((o) => ({
    ...o,
    board: { ...o.board, minions: predictOpponentBoard(o, turn).minions },
  }));

  const scored: Recommendation[] = candidates.map((c) => {
    const result = withBudget(
      () => scoreCandidate(c.projectedBoard, player, projectedOpponents, n),
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

/**
 * Score all shop sell candidates via simulation with a time budget.
 *
 * For each board minion, enumerates sell candidates, scores each via
 * `scoreSellCandidate` wrapped in `withBudget`, and returns the top N
 * sorted by winPct.
 *
 * When n=0 (no simulations), returns recommendations with score 0
 * so the heuristic path can still produce output.
 */
export function scoreSellsWithSim(state: GameState, n: number, budgetMs: number): Recommendation[] {
  const candidates = enumerateSellCandidates(state);
  const { player, opponents, turn } = state;

  const projectedOpponents = opponents.map((o) => ({
    ...o,
    board: { ...o.board, minions: predictOpponentBoard(o, turn).minions },
  }));

  const scored: Recommendation[] = candidates.map((c) => {
    const result = withBudget(
      () => scoreSellCandidate(c.projectedBoard, player, projectedOpponents, n),
      budgetMs,
      { winPct: 0, avgHpDelta: 0 },
    );

    return {
      action: c.action,
      score: result.winPct,
      confidence: Math.min(1, result.winPct + 0.05),
      reason:
        result.winPct > 0.5
          ? 'projected win rate above 50% after selling'
          : result.winPct > 0
            ? 'projected win rate below 50% after selling'
            : 'no simulation data',
    };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, TOP_N);
}

/**
 * Score a tier-up candidate via simulation with a time budget.
 *
 * When the player can afford to tier up, evaluates the current board
 * against all opponents (no board change from tiering up itself) and
 * returns a single recommendation with the simulated win rate.
 *
 * When n=0 (no simulations), returns a recommendation with score 0
 * so the heuristic path can still produce output.
 */
export function scoreTierUpWithSim(
  state: GameState,
  n: number,
  budgetMs: number,
): Recommendation[] {
  const candidates = enumerateTierUpCandidates(state);
  const { player, opponents, turn } = state;

  if (candidates.length === 0) {
    return [];
  }

  const projectedOpponents = opponents.map((o) => ({
    ...o,
    board: { ...o.board, minions: predictOpponentBoard(o, turn).minions },
  }));

  const result = withBudget(
    () => scoreCandidate(player.board, player, projectedOpponents, n),
    budgetMs,
    { winPct: 0, avgHpDelta: 0 },
  );

  return [
    {
      action: { type: 'TierUp' },
      score: result.winPct,
      confidence: Math.min(1, result.winPct + 0.05),
      reason:
        result.winPct > 0.5
          ? 'can tier up with strong projected win rate'
          : result.winPct > 0
            ? 'can tier up, evaluating win rate'
            : 'can tier up, no simulation data',
    },
  ];
}

/**
 * Score a freeze candidate via simulation with a time budget.
 *
 * When the shop is not frozen, evaluates the current board against all
 * opponents and returns a single freeze recommendation with the
 * simulated win rate.
 *
 * When n=0 (no simulations), returns a recommendation with score 0
 * so the heuristic path can still produce output.
 */
export function scoreFreezeWithSim(
  state: GameState,
  n: number,
  budgetMs: number,
): Recommendation[] {
  const candidates = enumerateFreezeCandidates(state);
  const { player, opponents, turn } = state;

  if (candidates.length === 0) {
    return [];
  }

  const projectedOpponents = opponents.map((o) => ({
    ...o,
    board: { ...o.board, minions: predictOpponentBoard(o, turn).minions },
  }));

  const result = withBudget(
    () => scoreCandidate(player.board, player, projectedOpponents, n),
    budgetMs,
    { winPct: 0, avgHpDelta: 0 },
  );

  return [
    {
      action: { type: 'Freeze' },
      score: result.winPct,
      confidence: Math.min(1, result.winPct + 0.05),
      reason:
        result.winPct > 0.5
          ? 'freezing shop preserves strong board for future turns'
          : result.winPct > 0
            ? 'freezing shop to evaluate future options'
            : 'freezing shop, no simulation data',
    },
  ];
}

/**
 * Score a reroll candidate via simulation with a time budget.
 *
 * When the player can afford to reroll, evaluates the current board
 * against all opponents and returns a single reroll recommendation with
 * the simulated win rate.
 *
 * When n=0 (no simulations), returns a recommendation with score 0
 * so the heuristic path can still produce output.
 */
export function scoreRerollWithSim(
  state: GameState,
  n: number,
  budgetMs: number,
): Recommendation[] {
  const candidates = enumerateRerollCandidates(state);
  const { player, opponents, turn } = state;

  if (candidates.length === 0) {
    return [];
  }

  const projectedOpponents = opponents.map((o) => ({
    ...o,
    board: { ...o.board, minions: predictOpponentBoard(o, turn).minions },
  }));

  const result = withBudget(
    () => scoreCandidate(player.board, player, projectedOpponents, n),
    budgetMs,
    { winPct: 0, avgHpDelta: 0 },
  );

  return [
    {
      action: { type: 'Reroll' },
      score: result.winPct,
      confidence: Math.min(1, result.winPct + 0.05),
      reason:
        result.winPct > 0.5
          ? 'rerolling shop preserves strong board for better options'
          : result.winPct > 0
            ? 'rerolling shop to find better options'
            : 'rerolling shop, no simulation data',
    },
  ];
}
