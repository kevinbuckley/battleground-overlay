import type { TagChange } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';

export function applyHeroPower(state: GameState, event: TagChange): GameState {
  if (event.tag !== 'NUM_TIMES_HERO_POWER_USED_THIS_GAME') return state;

  const value = Number.parseInt(event.value, 10);
  if (Number.isNaN(value)) return state;

  // Only track on own controller
  const entityId = Number.parseInt(event.entity, 10);
  if (entityId !== state.player.entityId) return state;

  return {
    ...state,
    player: {
      ...state.player,
      heroPowerUsedThisTurn: value > 0,
    },
  };
}
