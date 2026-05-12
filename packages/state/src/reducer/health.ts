import type { GameState } from '@overlay/shared';
import type { TagChange } from '@overlay/log-parser';

export function applyHeroHealth(state: GameState, event: TagChange): GameState {
  const entityId = parseInt(event.entity, 10);
  if (isNaN(entityId)) return state;
  if (entityId !== state.player.hero.entityId) return state;

  const hp = parseInt(event.value, 10);
  if (isNaN(hp)) return state;

  return {
    ...state,
    player: {
      ...state.player,
      hero: { ...state.player.hero, hp },
    },
  };
}
