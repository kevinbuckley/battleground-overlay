import type { HsEvent } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';

export function applyGameType(state: GameState, event: HsEvent): GameState {
  if (event.kind !== 'TAG_CHANGE' || event.tag !== 'GAME_TYPE') {
    return state;
  }
  const entityId = Number.parseInt(event.entity, 10);
  if (entityId !== state.player.entityId) {
    return state;
  }
  return {
    ...state,
    player: {
      ...state.player,
      gameType: event.value === '0' ? null : event.value,
    },
  };
}
