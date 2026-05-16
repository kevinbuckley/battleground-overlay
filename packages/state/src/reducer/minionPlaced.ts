import { getCardById } from '@overlay/card-data';
import type { HsEvent } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';
import { extractEntityId, extractEntityPriorZone } from '../entityId';
import { applyEntityEvent } from '../entityRegistry';

export function applyMinionPlaced(state: GameState, event: HsEvent): GameState {
  if (event.kind === 'FULL_ENTITY') {
    const nextRegistry = applyEntityEvent(new Map(state.player.entityRegistry), event);
    return {
      ...state,
      player: {
        ...state.player,
        entityRegistry: nextRegistry,
      },
    };
  }

  if (event.kind !== 'TAG_CHANGE') return state;

  // Always keep the entity registry in sync for this entity
  const entityId = extractEntityId(event.entity);
  if (entityId === null) return state;
  const nextRegistry = applyEntityEvent(new Map(state.player.entityRegistry), event);
  const info = nextRegistry.get(entityId);
  if (!info) return state;

  // If this is a ZONE change to PLAY and the entity belongs to the player,
  // add a stub minion to the board.
  if (event.tag === 'ZONE' && event.value === 'PLAY') {
    // Need a resolved local-player id before we can trust the controller match;
    // otherwise controller 0 (unowned/game) is matched and the board fills up
    // with non-minion entities.
    if (state.player.playerId === 0) return state;
    // Only add if the entity's controller is explicitly the player's.
    // Controller 0 is the default from FULL_ENTITY and means "unknown" —
    // we wait for a TAG_CHANGE tag=CONTROLLER to resolve ownership.
    if (info.controller !== state.player.playerId) return state;

    // Check if already on board
    const existing = state.player.board.minions.find((m) => m.entityId === entityId);
    if (existing) return state;

    // BG only places a minion on YOUR board when it transitions from HAND→PLAY
    // (you played the card from hand). SETASIDE→PLAY is a shop slot refresh,
    // and other transitions are ephemeral combat-side resolution that we
    // shouldn't track on the persistent board.
    const priorZone = extractEntityPriorZone(event.entityRaw ?? '');
    if (priorZone !== 'HAND') {
      return { ...state, player: { ...state.player, entityRegistry: nextRegistry } };
    }
    // Also filter out non-minion entities (Bob the Bartender, hero portraits,
    // hero powers, trinkets) that occasionally flow through HAND→PLAY too.
    const card = getCardById(info.cardId);
    const isBartenderOrUtility =
      info.cardId.startsWith('TB_BaconShop') ||
      info.cardId.startsWith('BG30_Trinket') ||
      info.cardId === '';
    if (isBartenderOrUtility) {
      return { ...state, player: { ...state.player, entityRegistry: nextRegistry } };
    }
    return {
      ...state,
      player: {
        ...state.player,
        entityRegistry: nextRegistry,
        board: {
          ...state.player.board,
          minions: [
            ...state.player.board.minions,
            {
              entityId,
              cardId: info.cardId,
              // Prefer live ATK/HEALTH already observed in the registry; fall
              // back to the card's printed stats.
              attack: info.attack ?? card?.attack ?? 0,
              health: info.health ?? card?.health ?? 0,
              taunt: false,
              divineShield: false,
              poisonous: false,
              reborn: false,
              frozen: false,
              golden: false,
              tribes: card?.race ? [card.race] : [],
            },
          ],
        },
      },
    };
  }

  // For non-ZONE tag changes (CONTROLLER, CARDID), just update the registry
  return {
    ...state,
    player: {
      ...state.player,
      entityRegistry: nextRegistry,
    },
  };
}
