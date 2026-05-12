import type { Board, BuyAction, GameState, Minion, SellAction } from '@overlay/shared';

export interface BuyCandidate {
  action: BuyAction;
  projectedBoard: Board;
}

export interface SellCandidate {
  action: SellAction;
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

/**
 * Enumerate one sell candidate per board minion.
 * The projected board is the player's current board with that minion
 * removed (as if sold).
 */
export function enumerateSellCandidates(state: GameState): SellCandidate[] {
  const currentBoard = state.player.board;
  const minions = currentBoard.minions;

  const candidates: SellCandidate[] = [];

  for (let i = 0; i < minions.length; i++) {
    const minion = minions[i];
    if (minion == null) continue;

    // Build projected board: current minions minus the one being sold
    const projectedMinions: Minion[] = [...minions.slice(0, i), ...minions.slice(i + 1)];

    candidates.push({
      action: { type: 'Sell', boardIndex: i },
      projectedBoard: { minions: projectedMinions },
    });
  }

  return candidates;
}
