import type {
  Board,
  BuyAction,
  FreezeAction,
  GameState,
  Minion,
  RerollAction,
  SellAction,
  TierUpAction,
} from '@overlay/shared';

export interface BuyCandidate {
  action: BuyAction;
  projectedBoard: Board;
}

export interface SellCandidate {
  action: SellAction;
  projectedBoard: Board;
}

export interface FreezeCandidate {
  action: FreezeAction;
  projectedBoard: Board;
}

export interface RerollCandidate {
  action: RerollAction;
  projectedBoard: Board;
}

export interface TierUpCandidate {
  action: TierUpAction;
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
  if (state.player.board.minions.length === 0) return [];

  const currentBoard = state.player.board;
  const minions = currentBoard.minions;

  const candidates: SellCandidate[] = [];

  for (let i = 0; i < minions.length; i++) {
    const minion = minions[i];
    if (minion == null) continue;

    // Build projected board: current minions minus the one being sold
    const projectedMinions: Minion[] = [...minions.slice(0, i), ...minions.slice(i + 1)];

    candidates.push({
      action: { type: 'Sell', boardIndex: i, cardId: minion.cardId },
      projectedBoard: { minions: projectedMinions },
    });
  }

  return candidates;
}

/**
 * Enumerate a single freeze candidate when the shop is not frozen.
 * Freezing already-frozen shop provides no benefit.
 */
export function enumerateFreezeCandidates(state: GameState): FreezeCandidate[] {
  if (state.player.shop.frozen) {
    return [];
  }
  return [
    {
      action: { type: 'Freeze' },
      projectedBoard: state.player.board,
    },
  ];
}

/**
 * Enumerate a single reroll candidate when the player can afford it.
 */
export function enumerateRerollCandidates(state: GameState): RerollCandidate[] {
  if (state.player.gold < state.player.shop.rollCost) {
    return [];
  }
  return [
    {
      action: { type: 'Reroll' },
      projectedBoard: state.player.board,
    },
  ];
}

/**
 * Enumerate a single tier-up candidate when affordable and not max tier.
 */
export function enumerateTierUpCandidates(state: GameState): TierUpCandidate[] {
  if (state.player.gold < state.player.tierUpCost || state.player.tier >= 6) {
    return [];
  }
  return [
    {
      action: { type: 'TierUp' },
      projectedBoard: state.player.board,
    },
  ];
}
