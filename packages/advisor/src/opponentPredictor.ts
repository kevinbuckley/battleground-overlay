import type { Minion, OpponentState } from '@overlay/shared';

function predictedMinion(opp: OpponentState, index: number, turn: number): Minion {
  const tierScale = Math.max(1, opp.tier);
  const turnScale = Math.max(0, turn - 3);
  const stats = Math.max(1, Math.round(tierScale + turnScale * 0.5));
  return {
    entityId: -((opp.entityId || opp.playerId || 1) * 10 + index + 1),
    cardId: 'BG_GVG_085',
    attack: stats,
    health: stats + 1,
    taunt: false,
    divineShield: false,
    poisonous: false,
    reborn: false,
    frozen: false,
    golden: false,
    windfury: false,
    cleave: false,
    elite: false,
    lifesteal: false,
    cost: 3,
    tribes: ['Mech'],
    spellPower: 0,
    exhausted: false,
    magnetic: false,
    immune: false,
    charge: false,
  };
}

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

  if (baseMinions.length === 0 && opp.minionsOnBoard > 0) {
    return {
      minions: Array.from({ length: Math.min(7, opp.minionsOnBoard) }, (_, i) =>
        predictedMinion(opp, i, turn),
      ),
    };
  }

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
