import type { TagChange } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';

export function applyTrinket(state: GameState, event: TagChange): GameState {
  if (event.tag !== 'TRINKET') return state;

  const entityId = Number.parseInt(event.entity, 10);
  if (Number.isNaN(entityId)) return state;

  // Only handle trinket events on the player's controller (controller === 1)
  const registry = state.player.entityRegistry;
  const playerEntry = registry.get(entityId);
  if (!playerEntry || playerEntry.controller !== 1) return state;

  const trinketValue = Number.parseInt(event.value, 10);
  if (Number.isNaN(trinketValue)) return state;

  // Only act when trinket is used (value=1), not when cleared (value=0)
  if (trinketValue !== 1) return state;

  const next = { ...state };
  const nextPlayer = { ...next.player };

  // Allocate next entity ID from the registry
  let nextEntityId = 0;
  if (registry.size > 0) {
    nextEntityId = Math.max(...registry.keys()) + 1;
  }

  // Add the trinket entity to the registry as being in HAND zone
  const newRegistry = new Map(registry);
  newRegistry.set(nextEntityId, {
    cardId: 'Trinket',
    zone: 'HAND',
    controller: 1,
  });

  // Add the entity to the player's hand
  const nextHand = [...nextPlayer.hand, nextEntityId];

  // Set the trinketUsed flag
  nextPlayer.trinketUsed = true;
  nextPlayer.hand = nextHand;
  nextPlayer.entityRegistry = newRegistry;

  next.player = nextPlayer;
  return next;
}
