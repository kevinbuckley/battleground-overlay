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
}
