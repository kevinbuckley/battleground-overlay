import type { HsEvent } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';

export function applyGoldSpent(state: GameState, event: HsEvent): GameState {
  if (event.kind !== 'TAG_CHANGE') return state;
  if (event.tag !== 'RESOURCES_USED') return state;
  if (event.entity !== String(state.player.entityId)) return state;

  const value = Number.parseInt(event.value, 10);
  if (Number.isNaN(value)) return state;

  return {
    ...state,
    player: {
      ...state.player,
      goldSpentThisTurn: value,
    },
  };
}
