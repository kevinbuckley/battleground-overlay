import type { HsEvent } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';

export function applyHeroPowerCost(state: GameState, event: HsEvent): GameState {
  if (event.kind !== 'TAG_CHANGE' || event.tag !== 'HERO_POWER_COST') {
    return state;
  }
  if (event.entity !== String(state.player.entityId)) {
    return state;
  }
  const cost = Number.parseInt(event.value, 10);
  if (Number.isNaN(cost)) {
    return state;
  }
  return {
    ...state,
    player: {
      ...state.player,
      heroPowerCost: cost,
    },
  };
}
