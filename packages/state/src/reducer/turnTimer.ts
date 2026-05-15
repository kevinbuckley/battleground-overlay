import type { TagChange } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';

export function applyTurnTimer(state: GameState, event: TagChange): GameState {
  if (event.tag !== 'TIMEOUT') return state;
  if (event.entity !== String(state.player.entityId)) return state;

  const timer = Number.parseInt(event.value, 10);
  if (Number.isNaN(timer)) return state;

  return {
    ...state,
    player: {
      ...state.player,
      turnTimer: timer,
    },
  };
}
