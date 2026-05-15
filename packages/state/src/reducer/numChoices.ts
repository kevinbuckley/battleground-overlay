import type { TagChange } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';

/**
 * Handles `TAG_CHANGE tag=NUM_CHOICES` on the player controller.
 * Sets `state.player.numChoices: number`.
 */
export function applyNumChoices(state: GameState, event: TagChange): GameState {
  if (event.tag !== 'NUM_CHOICES') return state;

  const entityId = Number.parseInt(event.entity, 10);
  if (Number.isNaN(entityId) || entityId !== state.player.entityId) return state;

  const value = Number.parseInt(event.value, 10);
  if (Number.isNaN(value)) return state;

  return {
    ...state,
    player: {
      ...state.player,
      numChoices: value,
    },
  };
}
