import type { TagChange } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';

export function applyAttackBuff(state: GameState, event: TagChange): GameState {
  if (event.tag !== 'ATK') return state;

  const entityId = Number.parseInt(event.entity, 10);
  if (Number.isNaN(entityId)) return state;

  const newAttack = Number.parseInt(event.value, 10);
  if (Number.isNaN(newAttack)) return state;

  const playerMinion = state.player.board.minions.find((m) => m.entityId === entityId);
  const opponentMinion = state.opponents
    .flatMap((o) => o.board.minions)
    .find((m) => m.entityId === entityId);

  if (!playerMinion && !opponentMinion) return state;

  if (playerMinion) {
    return {
      ...state,
      player: {
        ...state.player,
        board: {
          ...state.player.board,
          minions: state.player.board.minions.map((m) =>
            m.entityId === entityId ? { ...m, attack: newAttack } : m,
          ),
        },
      },
    };
  }

  const updatedOpponents = state.opponents.map((o) => {
    if (o.board.minions.some((m) => m.entityId === entityId)) {
      return {
        ...o,
        board: {
          ...o.board,
          minions: o.board.minions.map((m) =>
            m.entityId === entityId ? { ...m, attack: newAttack } : m,
          ),
        },
      };
    }
    return o;
  });

  return { ...state, opponents: updatedOpponents };
}
