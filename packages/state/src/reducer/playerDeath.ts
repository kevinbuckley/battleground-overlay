import type { TagChange } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';

export function applyPlayerDeath(state: GameState, event: TagChange): GameState {
  const entityId = Number.parseInt(event.entity, 10);
  if (Number.isNaN(entityId)) return state;
  if (entityId !== state.player.entityId) return state;
  if (event.tag !== 'HEALTH') return state;
  if (event.value !== '0') return state;
  if (state.player.eliminated) return state;

  return {
    ...state,
    player: {
      ...state.player,
      eliminated: true,
    },
  };
}
