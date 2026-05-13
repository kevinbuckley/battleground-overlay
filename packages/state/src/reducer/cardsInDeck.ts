import type { TagChange } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';

export function applyCardsInDeck(state: GameState, event: TagChange): GameState {
  if (event.tag !== 'NUM_CARDS_IN_DECK') return state;
  const entityId = Number.parseInt(event.entity, 10);
  if (Number.isNaN(entityId)) return state;
  if (entityId !== state.player.hero.entityId) return state;

  const deckSize = Number.parseInt(event.value, 10);
  if (Number.isNaN(deckSize)) return state;

  return {
    ...state,
    player: {
      ...state.player,
      deckSize,
    },
  };
}
