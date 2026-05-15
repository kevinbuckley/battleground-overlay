import type { HsEvent } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';

/**
 * Handles `TAG_CHANGE tag=DISCOVER` on the player controller.
 *
 * In Battlegrounds, discover events occur when the player makes a
 * choice from a set of offered cards (e.g., triple-bonus discover,
 * certain hero powers). The game logs `TAG_CHANGE tag=DISCOVER
 * Entity=<playerEntityId> value=<cardId>` when a card is selected,
 * and `value=0` when the discover is cancelled/cleared.
 *
 * This handler sets `state.player.discoveredCardId` to the selected
 * cardId, or `null` when the tag value is `'0'`.
 */
export function applyDiscover(state: GameState, event: HsEvent): GameState {
  if (event.kind !== 'TAG_CHANGE') return state;
  if (event.tag !== 'DISCOVER') return state;

  const entityId = Number.parseInt(event.entity, 10);
  if (entityId !== state.player.entityId) return state;

  const next = { ...state };
  const nextPlayer = { ...next.player };

  if (event.value === '0') {
    nextPlayer.discoveredCardId = null;
  } else {
    nextPlayer.discoveredCardId = event.value;
  }

  next.player = nextPlayer;
  return next;
}
