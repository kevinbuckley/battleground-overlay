import type { GameState, Recommendation } from '@overlay/shared';
import { scoreBuysWithSim, scoreSellsWithSim } from './budgetScorer';
import { freezeMinion } from './heuristics/freezeMinion';
import { rerollScore } from './heuristics/rerollScore';
import { sellScore } from './heuristics/sellScore';
import { tierCurveScore } from './heuristics/tierCurve';
import { tribeSynergyScore } from './heuristics/tribeSynergy';
import { tripleScore } from './heuristics/triple';
import { hillClimbPosition } from './positionHillClimb';

const TOP_N = 3;

export function recommend(state: GameState): Recommendation[] {
  const { player } = state;

  // Triple discover: if a triple is pending, recommend buying it immediately.
  if (player.pendingTriple !== null) {
    return [
      {
        action: { type: 'Buy', cardId: player.pendingTriple, shopIndex: -1 },
        score: 1.0,
        confidence: 1.0,
        reason: 'complete your triple',
        needsExplanation: false,
      },
    ];
  }

  const shopMinions = player.shop.minions;
  const boardMinions = player.board.minions;

  // Simulation-based buy scores (primary source)
  const simRecs = scoreBuysWithSim(state, 50, 2000);

  // Heuristic-based buy scores (fallback when sim returns nothing)
  const heuristicBuyRecs: Recommendation[] = shopMinions.map((shopCard, i) => {
    const triple = tripleScore(shopCard, boardMinions);
    const tribe = tribeSynergyScore(boardMinions, shopCard);
    const score = triple * 0.6 + tribe * 0.4;

    return {
      action: { type: 'Buy', cardId: shopCard.cardId, shopIndex: i },
      score,
      confidence: Math.min(1, score + 0.1),
      reason: triple > 0 ? 'triple opportunity' : tribe > 0 ? 'tribe synergy' : 'no strong reason',
    };
  });

  // Use sim recs only when they have actual simulation signal (score > 0);
  // otherwise fall back to heuristics so existing behavior is preserved.
  const buyRecs: Recommendation[] = simRecs.some((r) => r.score > 0) ? simRecs : heuristicBuyRecs;

  const tierScore = tierCurveScore(
    state.turn,
    player.hero.hp,
    player.gold,
    player.tier,
    player.tierUpCost,
  );

  const tierRec: Recommendation | null =
    tierScore > 0.5
      ? {
          action: { type: 'TierUp' },
          score: tierScore,
          confidence: tierScore,
          reason: 'on curve to tier up',
        }
      : null;

  // Simulation-based sell scores (primary source)
  const simSellRecs = scoreSellsWithSim(state, 50, 2000);

  // Heuristic-based sell scores (fallback when sim returns nothing)
  const heuristicSellRecs: Recommendation[] = boardMinions
    .map((minion, idx) => {
      const score = sellScore(minion, boardMinions, state);
      if (score < 0.5) return null;
      return {
        action: { type: 'Sell', boardIndex: idx },
        score,
        confidence: Math.min(1, score + 0.1),
        reason: score >= 0.8 ? 'weak with no synergy' : 'low sell value',
      } as Recommendation;
    })
    .filter((r): r is Recommendation => r !== null);

  // Use sim sell recs only when they have actual simulation signal (score > 0);
  // otherwise fall back to heuristics so existing behavior is preserved.
  const sellRecs: Recommendation[] = simSellRecs.some((r) => r.score > 0)
    ? simSellRecs
    : heuristicSellRecs;

  const freezeRec: Recommendation | null = (() => {
    const freezeAction = freezeMinion(state);
    if (!freezeAction) return null;
    const overallScore = 0.5;
    return {
      action: freezeAction,
      score: overallScore,
      confidence: 0.5,
      reason: 'freeze shop for better reroll',
    };
  })();

  const rerollRec: Recommendation | null = (() => {
    const score = rerollScore(state);
    if (score < 0.5) return null;
    return {
      action: { type: 'Reroll' },
      score,
      confidence: Math.min(1, score + 0.1),
      reason: 'no good buys, safe to reroll',
    };
  })();

  // Position hill-climb: check if repositioning improves win rate
  const positionResult = hillClimbPosition(state.player.board, state.player, state.opponents, 50);
  const repositionRec: Recommendation | null =
    positionResult.scoreDelta > 0.05 &&
    positionResult.fromIndex !== null &&
    positionResult.toIndex !== null
      ? {
          action: {
            type: 'Reposition',
            fromIndex: positionResult.fromIndex,
            toIndex: positionResult.toIndex,
          },
          score: positionResult.scoreDelta,
          confidence: positionResult.scoreDelta,
          reason: 'improved win rate by repositioning',
        }
      : null;

  const all = [
    ...buyRecs,
    ...(tierRec ? [tierRec] : []),
    ...(freezeRec ? [freezeRec] : []),
    ...sellRecs,
    ...(rerollRec ? [rerollRec] : []),
    ...(repositionRec ? [repositionRec] : []),
  ];
  const sorted = all.sort((a, b) => b.score - a.score).slice(0, TOP_N);
  const needsExplanation = sorted.length === 0 || sorted.every((r) => r.score < 0.4);
  return sorted.map((r) => ({ ...r, needsExplanation }));
}
