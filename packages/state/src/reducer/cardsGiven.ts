import type { TagChange } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';

export function applyCardsGiven(state: GameState, event: TagChange): GameState {
  if (event.tag !== 'NUM_CARDS_GIVEN_THIS_TURN') return state;

  const value = Number.parseInt(event.value, 10);
  if (Number.isNaN(value)) return state;

  const entityId = Number.parseInt(event.entity, 10);
  if (entityId !== state.player.entityId) return state;

  return {
    ...state,
    player: {
      ...state.player,
      cardsGivenThisTurn: value,
    },
  };
}
