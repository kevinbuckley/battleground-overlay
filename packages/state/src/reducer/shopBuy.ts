import { getCardById } from '@overlay/card-data';
import type { HsEvent } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';
import { extractEntityId } from '../entityId';
import { applyEntityEvent } from '../entityRegistry';

export function applyShopBuy(state: GameState, event: HsEvent): GameState {
  if (event.kind !== 'TAG_CHANGE') return state;
  if (event.tag !== 'ZONE') return state;
  if (event.value !== 'PLAY') return state;

  const entityId = extractEntityId(event.entity);
  if (entityId === null) return state;

  // Update the entity registry to get the latest info for this entity
  const nextRegistry = applyEntityEvent(new Map(state.player.entityRegistry), event);
  const info = nextRegistry.get(entityId);

  // Only process if the entity belongs to the player
  if (!info || info.controller !== state.player.playerId) return state;

  // Look up card data for attack, health, tribes (fall back to defaults)
  const card = getCardById(info.cardId);

  // Remove from shop using the original shop state (before the zone change)
  const shopMinions = state.player.shop.minions.filter((m) => m.entityId !== entityId);

  // If the entity was not in the shop, this is not a shop buy
  if (shopMinions.length === state.player.shop.minions.length) return state;

  // Add to board
  const boardMinions = state.player.board.minions;
  const alreadyOnBoard = boardMinions.find((m) => m.entityId === entityId);
  if (alreadyOnBoard) return state;

  const newMinion = {
    entityId,
    cardId: info.cardId,
    attack: card?.attack ?? 0,
    health: card?.health ?? 0,
    taunt: false,
    divineShield: false,
    poisonous: false,
    reborn: false,
    frozen: false,
    tribes: card?.race ? [card.race] : [],
  };

  return {
    ...state,
    player: {
      ...state.player,
      entityRegistry: nextRegistry,
      shop: {
        ...state.player.shop,
        minions: shopMinions,
      },
      board: {
        ...state.player.board,
        minions: [...boardMinions, newMinion],
      },
    },
  };
}
