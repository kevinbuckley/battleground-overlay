import type { HsEvent } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';

/**
 * Detects when 3 identical cardIds appear across board + hand
 * (by checking entityRegistry) and sets `pendingTriple`.
 *
 * Triggered by a TAG_CHANGE on an entity whose cardId was just
 * resolved (CARDID tag) or when a new entity enters the player's
 * board/hand with a cardId that completes a triple.
 */
export function applyTripleBonus(state: GameState, event: HsEvent): GameState {
  if (event.kind !== 'TAG_CHANGE') return state;

  const entityId = Number.parseInt(event.entity, 10);
  if (Number.isNaN(entityId)) return state;

  const registry = state.player.entityRegistry;
  const regEntry = registry.get(entityId);

  // Only care about player's own entities (controller = 1)
  if (!regEntry || regEntry.controller !== 1) return state;

  // Only care about entities in PLAY, SHOP, or HAND zones
  if (regEntry.zone !== 'PLAY' && regEntry.zone !== 'SHOP' && regEntry.zone !== 'HAND') {
    return state;
  }

  // If the event is a CARDID change, update the registry entry
  // and then re-check for triples
  let cardId = regEntry.cardId;
  if (event.tag === 'CARDID') {
    cardId = event.value;
  }

  // Count how many of this cardId exist across board + hand
  let count = 0;

  // Check board minions
  for (const minion of state.player.board.minions) {
    if (minion.cardId === cardId) {
      count++;
    }
  }

  // Check hand: resolve entityIds in hand to cardIds via registry
  for (const handEntityId of state.player.hand) {
    const handReg = registry.get(handEntityId);
    if (handReg && handReg.cardId === cardId) {
      count++;
    }
  }

  // Check shop minions
  for (const shopMinion of state.player.shop.minions) {
    if (shopMinion.cardId === cardId) {
      count++;
    }
  }

  const next = { ...state };
  const nextPlayer = { ...next.player };

  if (count >= 3) {
    nextPlayer.pendingTriple = cardId;
  } else {
    // If the event changed a minion's cardId away from the
    // current pendingTriple, clear it.  Also clear if the
    // event's cardId is not the pendingTriple and the entity
    // was contributing to the triple (i.e. its old cardId
    // matched pendingTriple but the new one doesn't).
    const oldCardId = regEntry.cardId;
    if (event.tag === 'CARDID' && nextPlayer.pendingTriple === oldCardId) {
      nextPlayer.pendingTriple = null;
    }
  }

  next.player = nextPlayer;
  return next;
}
