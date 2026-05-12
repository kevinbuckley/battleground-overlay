import type { OpponentState } from '@overlay/shared';

/**
 * Predicts the opponent's board for use in simulation search.
 *
 * v0: returns the opponent's board as-is with no projection.
 * Future versions will infer likely board state from tier,
 * eliminations, and entity registry data.
 */
export function predictOpponentBoard(opp: OpponentState): {
  minions: import('@overlay/shared').Minion[];
} {
  return { minions: [...opp.board.minions] };
}
