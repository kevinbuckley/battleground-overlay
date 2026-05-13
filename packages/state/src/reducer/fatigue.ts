import type { TagChange } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';

export function applyFatigue(state: GameState, event: TagChange): GameState {
  if (event.tag !== 'FATIGUE' && event.tag !== 'FATIGUE_COST') return state;
  if (event.entity !== String(state.player.entityId)) return state;

  const fatigueCost = Number.parseInt(event.value, 10);
  if (Number.isNaN(fatigueCost) || fatigueCost <= 0) return state;

  const newHp = Math.max(0, state.player.hero.hp - fatigueCost);

  return {
    ...state,
    player: {
      ...state.player,
      hero: {
        ...state.player.hero,
        hp: newHp,
      },
    },
  };
}
