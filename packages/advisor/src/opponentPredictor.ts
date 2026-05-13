import type { Minion, OpponentState } from '@overlay/shared';

/**
 * Predicts the opponent's board for use in simulation search.
 *
 * Scales minion attack/health upward when turn > 4 to account for
 * stat growth across tavern tiers. The scaling factor is
 * `1 + (turn - 4) * 0.1` capped at 1.5x.
 */
export function predictOpponentBoard(
  opp: OpponentState,
  turn: number,
): {
  minions: Minion[];
} {
  const baseMinions = opp.board.minions;

  if (turn <= 4) {
    return { minions: [...baseMinions] };
  }

  const scale = Math.min(1.5, 1 + (turn - 4) * 0.1);

  return {
    minions: baseMinions.map((m) => ({
      ...m,
      attack: Math.round(m.attack * scale),
      health: Math.round(m.health * scale),
    })),
  };
}
