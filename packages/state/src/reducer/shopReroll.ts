import type { TagChange } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';

export function applyShopReroll(state: GameState, event: TagChange): GameState {
  const entityId = Number.parseInt(event.entity, 10);
  if (isNaN(entityId)) return state;
  if (entityId !== state.player.entityId) return state;
  if (event.tag !== 'RESOURCES_USED') return state;

  const goldUsed = Number.parseInt(event.value, 10);
  if (isNaN(goldUsed)) return state;

  return {
    ...state,
    player: {
      ...state.player,
      gold: state.player.gold - goldUsed,
      shop: {
        ...state.player.shop,
        frozen: false,
      },
    },
  };
}
