import type { GameState, Recommendation } from '@overlay/shared';
import { scoreBuysWithSim } from './budgetScorer';
import { freezeMinion } from './heuristics/freezeMinion';
import { rerollScore } from './heuristics/rerollScore';
import { sellScore } from './heuristics/sellScore';
import { tierCurveScore } from './heuristics/tierCurve';
import { tribeSynergyScore } from './heuristics/tribeSynergy';
import { tripleScore } from './heuristics/triple';

const TOP_N = 3;

export function recommend(state: GameState): Recommendation[] {
  const { player } = state;
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

  const sellRecs: Recommendation[] = boardMinions
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

  const all = [
    ...buyRecs,
    ...(tierRec ? [tierRec] : []),
    ...(freezeRec ? [freezeRec] : []),
    ...sellRecs,
    ...(rerollRec ? [rerollRec] : []),
  ];
  return all.sort((a, b) => b.score - a.score).slice(0, TOP_N);
}
