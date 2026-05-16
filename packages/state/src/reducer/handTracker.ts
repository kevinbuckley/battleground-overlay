import type { HsEvent } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';
import { extractEntityId } from '../entityId';
import { applyEntityEvent } from '../entityRegistry';

export function applyHandTracker(state: GameState, event: HsEvent): GameState {
  if (event.kind !== 'TAG_CHANGE') return state;
  if (event.tag !== 'ZONE') return state;

  const entityId = extractEntityId(event.entity);
  if (entityId === null) return state;

  // Only process events for the player's own entities
  // (controller check is done via entityRegistry below)

  // Update the entity registry to get the latest info for this entity
  const nextRegistry = applyEntityEvent(new Map(state.player.entityRegistry), event);
  const info = nextRegistry.get(entityId);

  // Only process if the entity belongs to the player
  if (!info || info.controller !== state.player.playerId) return state;

  const currentHand = state.player.hand;

  if (event.value === 'HAND') {
    // Entity moved to HAND — add to hand array if not already there
    if (!currentHand.includes(entityId)) {
      return {
        ...state,
        player: {
          ...state.player,
          hand: [...currentHand, entityId],
          entityRegistry: nextRegistry,
        },
      };
    }
  } else if (
    event.value === 'PLAY' ||
    event.value === 'GRAVEYARD' ||
    event.value === 'REMOVEDFROMGAME'
  ) {
    // Entity moved out of HAND — remove from hand array
    const newHand = currentHand.filter((id) => id !== entityId);
    if (newHand.length === currentHand.length) return state;
    return {
      ...state,
      player: {
        ...state.player,
        hand: newHand,
        entityRegistry: nextRegistry,
      },
    };
  }

  return state;
}
