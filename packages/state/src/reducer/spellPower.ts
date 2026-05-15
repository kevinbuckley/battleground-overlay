import type { TagChange } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';

export function applySpellPower(state: GameState, event: TagChange): GameState {
  if (event.tag !== 'SPELL_POWER') return state;

  const entityId = Number.parseInt(event.entity, 10);
  if (Number.isNaN(entityId)) return state;

  const playerMinion = state.player.board.minions.find((m) => m.entityId === entityId);
  const opponentMinion = state.opponents
    .flatMap((o) => o.board.minions)
    .find((m) => m.entityId === entityId);

  if (!playerMinion && !opponentMinion) return state;

  const spellPowerValue = Number(event.value);

  if (playerMinion) {
    return {
      ...state,
      player: {
        ...state.player,
        board: {
          ...state.player.board,
          minions: state.player.board.minions.map((m) =>
            m.entityId === entityId ? { ...m, spellPower: spellPowerValue } : m,
          ),
        },
      },
    };
  }

  if (opponentMinion) {
    const updatedOpponents = state.opponents.map((o) => {
      if (o.board.minions.some((m) => m.entityId === entityId)) {
        return {
          ...o,
          board: {
            ...o.board,
            minions: o.board.minions.map((m) =>
              m.entityId === entityId ? { ...m, spellPower: spellPowerValue } : m,
            ),
          },
        };
      }
      return o;
    });
    return { ...state, opponents: updatedOpponents };
  }

  return state;
}
