import { getCardName } from '@overlay/card-data';
import type { GameState, Minion, OpponentState, Recommendation } from '@overlay/shared';
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

function pct(value: number): number {
  return Math.round(value * 100);
}

function hasOpponentBoardSignal(opponents: OpponentState[]): boolean {
  return opponents.some(
    (o) => !o.eliminated && (o.board.minions.length > 0 || o.minionsOnBoard > 0),
  );
}

/**
 * Build the projected minion array for an opponent.
 *
 * If the opponent has tracked stats (minionsOnBoard > 0), uses those
 * to construct a projected board from the opponent's existing board
 * minions, scaling stats by turn.  Otherwise falls back to
 * `predictOpponentBoard` which projects from scratch.
 */
function buildProjectedOpponentBoard(opp: OpponentState, turn: number): Minion[] {
  if (opp.minionsOnBoard > 0 && opp.board.minions.length > 0) {
    const predictor = predictOpponentBoard(opp, turn);
    if (predictor.minions.length >= opp.minionsOnBoard) {
      return predictor.minions;
    }
    const result: Minion[] = [];
    const pool = opp.board.minions;
    for (let i = 0; i < opp.minionsOnBoard; i++) {
      const base = pool[i % pool.length];
      if (!base) continue;
      const scale = Math.min(1.5, 1 + (turn - 4) * 0.1);
      result.push({
        ...base,
        attack: Math.round(base.attack * scale),
        health: Math.round(base.health * scale),
      });
    }
    return result;
  }
  return predictOpponentBoard(opp, turn).minions;
}

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
  const shouldSimulate = n > 0 && hasOpponentBoardSignal(opponents);

  const projectedOpponents = opponents.map((o) => ({
    ...o,
    board: { ...o.board, minions: buildProjectedOpponentBoard(o, turn) },
  }));

  const scored: Recommendation[] = candidates.map((c) => {
    const result = !shouldSimulate
      ? { winPct: 0, avgHpDelta: 0 }
      : withBudget(
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
          ? `Buy ${getCardName(c.action.cardId)} — ${pct(result.winPct)}% projected win rate`
          : result.winPct > 0
            ? `Buy ${getCardName(c.action.cardId)} — ${pct(result.winPct)}% projected win rate`
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
  const shouldSimulate = n > 0 && hasOpponentBoardSignal(opponents);

  const projectedOpponents = opponents.map((o) => ({
    ...o,
    board: { ...o.board, minions: buildProjectedOpponentBoard(o, turn) },
  }));

  const scored: Recommendation[] = candidates.map((c) => {
    const result = !shouldSimulate
      ? { winPct: 0, avgHpDelta: 0 }
      : withBudget(
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
          ? `Sell ${getCardName(c.action.cardId ?? '')} — ${pct(result.winPct)}% projected win rate`
          : result.winPct > 0
            ? `Sell ${getCardName(c.action.cardId ?? '')} — ${pct(result.winPct)}% projected win rate`
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
  const shouldSimulate = n > 0 && hasOpponentBoardSignal(opponents);

  if (candidates.length === 0) {
    return [];
  }

  const projectedOpponents = opponents.map((o) => ({
    ...o,
    board: { ...o.board, minions: buildProjectedOpponentBoard(o, turn) },
  }));

  const result = !shouldSimulate
    ? { winPct: 0, avgHpDelta: 0 }
    : withBudget(() => scoreCandidate(player.board, player, projectedOpponents, n), budgetMs, {
        winPct: 0,
        avgHpDelta: 0,
      });

  return [
    {
      action: { type: 'TierUp' },
      score: result.winPct,
      confidence: Math.min(1, result.winPct + 0.05),
      reason:
        result.winPct > 0.5
          ? `Tier up — ${pct(result.winPct)}% projected win rate`
          : result.winPct > 0
            ? `Tier up — ${pct(result.winPct)}% projected win rate`
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
  const shouldSimulate = n > 0 && hasOpponentBoardSignal(opponents);

  if (candidates.length === 0) {
    return [];
  }

  const projectedOpponents = opponents.map((o) => ({
    ...o,
    board: { ...o.board, minions: buildProjectedOpponentBoard(o, turn) },
  }));

  const result = !shouldSimulate
    ? { winPct: 0, avgHpDelta: 0 }
    : withBudget(() => scoreCandidate(player.board, player, projectedOpponents, n), budgetMs, {
        winPct: 0,
        avgHpDelta: 0,
      });

  return [
    {
      action: { type: 'Freeze' },
      score: result.winPct,
      confidence: Math.min(1, result.winPct + 0.05),
      reason:
        result.winPct > 0.5
          ? `Freeze shop — current board projects ${pct(result.winPct)}% win rate`
          : result.winPct > 0
            ? `Freeze shop — current board projects ${pct(result.winPct)}% win rate`
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
  const shouldSimulate = n > 0 && hasOpponentBoardSignal(opponents);

  if (candidates.length === 0) {
    return [];
  }

  const projectedOpponents = opponents.map((o) => ({
    ...o,
    board: { ...o.board, minions: buildProjectedOpponentBoard(o, turn) },
  }));

  const result = !shouldSimulate
    ? { winPct: 0, avgHpDelta: 0 }
    : withBudget(() => scoreCandidate(player.board, player, projectedOpponents, n), budgetMs, {
        winPct: 0,
        avgHpDelta: 0,
      });

  return [
    {
      action: { type: 'Reroll' },
      score: result.winPct,
      confidence: Math.min(1, result.winPct + 0.05),
      reason:
        result.winPct > 0.5
          ? `Reroll shop — current board projects ${pct(result.winPct)}% win rate`
          : result.winPct > 0
            ? `Reroll shop — current board projects ${pct(result.winPct)}% win rate`
            : 'rerolling shop, no simulation data',
    },
  ];
}
