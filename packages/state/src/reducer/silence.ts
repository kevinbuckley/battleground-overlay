import type { TagChange } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';

export function applySilence(state: GameState, event: TagChange): GameState {
  if (event.tag !== 'SILENCED') return state;
  if (event.value !== '1') return state;

  const entityId = Number.parseInt(event.entity, 10);
  if (Number.isNaN(entityId)) return state;

  // Only process entities in PLAY zone
  const playerMinion = state.player.board.minions.find((m) => m.entityId === entityId);
  const opponentMinion = state.opponents
    .flatMap((o) => o.board.minions)
    .find((m) => m.entityId === entityId);

  if (!playerMinion && !opponentMinion) return state;

  const cleared = { taunt: false, divineShield: false, poisonous: false, reborn: false };

  if (playerMinion) {
    return {
      ...state,
      player: {
        ...state.player,
        board: {
          ...state.player.board,
          minions: state.player.board.minions.map((m) =>
            m.entityId === entityId ? { ...m, ...cleared } : m,
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
              m.entityId === entityId ? { ...m, ...cleared } : m,
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
