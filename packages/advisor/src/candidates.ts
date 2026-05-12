import type { Board, BuyAction, GameState, Minion } from '@overlay/shared';

export interface BuyCandidate {
  action: BuyAction;
  projectedBoard: Board;
}

/**
 * Enumerate one buy candidate per shop minion.
 * The projected board is the player's current board with the shop
 * minion appended (as if bought).
 */
export function enumerateBuyCandidates(state: GameState): BuyCandidate[] {
  const shopMinions = state.player.shop.minions;
  const currentBoard = state.player.board;

  const candidates: BuyCandidate[] = [];

  for (let i = 0; i < shopMinions.length; i++) {
    const shopMinion = shopMinions[i];
    if (shopMinion == null) continue;

    // Build projected board: current minions + shop minion
    const projectedMinions: Minion[] = [...currentBoard.minions, shopMinion];

    candidates.push({
      action: { type: 'Buy', cardId: shopMinion.cardId, shopIndex: i },
      projectedBoard: { minions: projectedMinions },
    });
  }

  return candidates;
}
