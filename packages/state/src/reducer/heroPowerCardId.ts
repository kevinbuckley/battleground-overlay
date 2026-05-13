import type { TagChange } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';

export function applyHeroPowerCardId(state: GameState, event: TagChange): GameState {
  if (event.tag !== 'HERO_POWER_ID') return state;

  const entityId = Number.parseInt(event.entity, 10);
  if (entityId !== state.player.entityId) return state;

  const cardId = event.value || null;

  return {
    ...state,
    player: {
      ...state.player,
      heroPowerCardId: cardId,
    },
  };
}
