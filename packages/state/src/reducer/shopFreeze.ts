import type { TagChange } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';

export function applyShopFreeze(state: GameState, event: TagChange): GameState {
  const entityId = Number.parseInt(event.entity, 10);
  if (isNaN(entityId)) return state;
  if (entityId !== state.player.entityId) return state;
  if (event.tag !== 'FROZEN') return state;

  const frozenValue = Number.parseInt(event.value, 10);
  if (isNaN(frozenValue)) return state;

  const isFrozen = frozenValue === 1;

  return {
    ...state,
    player: {
      ...state.player,
      shop: {
        ...state.player.shop,
        frozen: isFrozen,
      },
    },
  };
}
