export type BuyAction = { type: 'Buy'; cardId: string; shopIndex: number };
export type SellAction = { type: 'Sell'; boardIndex: number };
export type FreezeAction = { type: 'Freeze' };
export type RerollAction = { type: 'Reroll' };
export type TierUpAction = { type: 'TierUp' };
export type RepositionAction = { type: 'Reposition'; fromIndex: number; toIndex: number };

export type RecommendationAction =
  | BuyAction
  | SellAction
  | FreezeAction
  | RerollAction
  | TierUpAction
  | RepositionAction;

export interface Recommendation {
  action: RecommendationAction;
  score: number;
  confidence: number;
  reason: string;
  needsExplanation?: boolean;
}

export function formatRecommendation(rec: Recommendation): string {
  const score = rec.score.toFixed(2);
  switch (rec.action.type) {
    case 'Buy':
      return `Buy ${rec.action.cardId} (score: ${score})`;
    case 'Sell':
      return `Sell position ${rec.action.boardIndex} (score: ${score})`;
    case 'Freeze':
      return `Freeze shop (score: ${score})`;
    case 'Reroll':
      return `Reroll (score: ${score})`;
    case 'TierUp':
      return `Tier up (score: ${score})`;
    case 'Reposition':
      return `Reposition ${rec.action.fromIndex}→${rec.action.toIndex} (score: ${score})`;
  }
}
