import { getCardName } from '@overlay/card-data';
import type { GameState, Recommendation } from '@overlay/shared';
import {
  scoreBuysWithSim,
  scoreFreezeWithSim,
  scoreRerollWithSim,
  scoreSellsWithSim,
  scoreTierUpWithSim,
} from './budgetScorer';
import { freezeMinion } from './heuristics/freezeMinion';
import { rerollScore } from './heuristics/rerollScore';
import { sellScore } from './heuristics/sellScore';
import { tierCurveScore } from './heuristics/tierCurve';
import { tribeSynergyScore } from './heuristics/tribeSynergy';
import { tripleScore } from './heuristics/triple';
import { hillClimbPosition } from './positionHillClimb';

const TOP_N = 3;

function pct(score: number): number {
  return Math.round(score * 100);
}

function buyBodyScore(cardAttack: number, cardHealth: number): number {
  return Math.min(0.2, Math.max(0, (cardAttack + cardHealth) / 50));
}

export function recommend(state: GameState): Recommendation[] {
  const { player } = state;

  // Triple discover: if a triple is pending, recommend buying it immediately.
  if (player.pendingTriple !== null) {
    return [
      {
        action: { type: 'Buy', cardId: player.pendingTriple, shopIndex: -1 },
        score: 1.0,
        confidence: 1.0,
        reason: `Complete your triple with ${getCardName(player.pendingTriple)}`,
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
    const genericBuy = player.gold >= 3 && boardMinions.length < 7 ? 0.45 : 0;
    const score = Math.max(
      triple * 0.6 + tribe * 0.4,
      genericBuy + buyBodyScore(shopCard.attack, shopCard.health),
    );

    return {
      action: { type: 'Buy', cardId: shopCard.cardId, shopIndex: i },
      score,
      confidence: Math.min(1, score + 0.1),
      reason:
        triple > 0
          ? `Buy ${getCardName(shopCard.cardId)} — completes or advances a triple`
          : tribe > 0
            ? `Buy ${getCardName(shopCard.cardId)} — ${pct(tribe)}% tribe synergy score`
            : player.gold >= 3 && boardMinions.length < 7
              ? `Buy ${getCardName(shopCard.cardId)} — best available board upgrade`
              : `Buy ${getCardName(shopCard.cardId)} — no strong synergy yet`,
    };
  });

  // Use sim recs only when they have actual simulation signal (score > 0);
  // otherwise fall back to heuristics so existing behavior is preserved.
  const buyRecs: Recommendation[] = simRecs.some((r) => r.score > 0) ? simRecs : heuristicBuyRecs;

  // Simulation-based tier-up scoring
  const simTierRecs = scoreTierUpWithSim(state, 50, 2000);
  const tierScore = tierCurveScore(
    state.turn,
    player.hero.hp,
    player.gold,
    player.tier,
    player.tierUpCost,
  );
  const heuristicTierRec: Recommendation | null =
    tierScore > 0.5
      ? {
          action: { type: 'TierUp' },
          score: tierScore,
          confidence: tierScore,
          reason: 'on curve to tier up',
        }
      : null;
  const tierRec: Recommendation | null = simTierRecs.some((r) => r.score > 0)
    ? (simTierRecs[0] ?? null)
    : heuristicTierRec;
  // Simulation-based sell scores (primary source)
  const simSellRecs = scoreSellsWithSim(state, 50, 2000);

  // Heuristic-based sell scores (fallback when sim returns nothing)
  const heuristicSellRecs: Recommendation[] = boardMinions
    .map((minion, idx) => {
      const score = sellScore(minion, boardMinions, state);
      if (score < 0.5) return null;
      return {
        action: { type: 'Sell', boardIndex: idx, cardId: minion.cardId },
        score,
        confidence: Math.min(1, score + 0.1),
        reason:
          score >= 0.8
            ? `Sell ${getCardName(minion.cardId)} — weakest board minion with low synergy`
            : `Sell ${getCardName(minion.cardId)} — low board value`,
      } as Recommendation;
    })
    .filter((r): r is Recommendation => r !== null);

  // Use sim sell recs only when they have actual simulation signal (score > 0);
  // otherwise fall back to heuristics so existing behavior is preserved.
  const sellRecs: Recommendation[] = simSellRecs.some((r) => r.score > 0)
    ? simSellRecs
    : heuristicSellRecs;

  // Simulation-based freeze scoring
  const simFreezeRecs = scoreFreezeWithSim(state, 50, 2000);
  const heuristicFreezeRec: Recommendation | null = (() => {
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
  const freezeRec: Recommendation | null = simFreezeRecs.some((r) => r.score > 0)
    ? (simFreezeRecs[0] ?? null)
    : heuristicFreezeRec;

  // Simulation-based reroll scoring
  const simRerollRecs = scoreRerollWithSim(state, 50, 2000);
  const heuristicRerollRec: Recommendation | null = (() => {
    const score = rerollScore(state);
    if (score < 0.5) return null;
    return {
      action: { type: 'Reroll' },
      score,
      confidence: Math.min(1, score + 0.1),
      reason: 'no good buys, safe to reroll',
    };
  })();
  const rerollRec: Recommendation | null = simRerollRecs.some((r) => r.score > 0)
    ? (simRerollRecs[0] ?? null)
    : heuristicRerollRec;

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
