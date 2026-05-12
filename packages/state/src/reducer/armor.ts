import type { TagChange } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';

export function applyArmor(state: GameState, event: TagChange): GameState {
  if (event.tag !== 'ARMOR') return state;
  const entityId = Number.parseInt(event.entity, 10);
  if (Number.isNaN(entityId)) return state;
  if (entityId !== state.player.hero.entityId) return state;

  const armor = Number.parseInt(event.value, 10);
  if (Number.isNaN(armor)) return state;

  return {
    ...state,
    player: {
      ...state.player,
      hero: { ...state.player.hero, armor },
    },
  };
}
