import type { GameState, Recommendation } from '@overlay/shared';
import { freezeMinion } from './heuristics/freezeMinion';
import { sellScore } from './heuristics/sellScore';
import { tierCurveScore } from './heuristics/tierCurve';
import { tribeSynergyScore } from './heuristics/tribeSynergy';
import { tripleScore } from './heuristics/triple';

const TOP_N = 3;

export function recommend(state: GameState): Recommendation[] {
  const { player } = state;
  const shopMinions = player.shop.minions;
  const boardMinions = player.board.minions;

  const buyRecs: Recommendation[] = shopMinions.map((shopCard, i) => {
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

  const all = [
    ...buyRecs,
    ...(tierRec ? [tierRec] : []),
    ...(freezeRec ? [freezeRec] : []),
    ...sellRecs,
  ];
  return all.sort((a, b) => b.score - a.score).slice(0, TOP_N);
}
