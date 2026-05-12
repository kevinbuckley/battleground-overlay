import { getCardById } from '@overlay/card-data';
import type { ZoneChangeList } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';

export function applyShopRefresh(state: GameState, event: ZoneChangeList): GameState {
  const shopEntityId = event.id;

  // Find the shop entity in the registry to confirm it belongs to the player
  const shopInfo = state.player.entityRegistry.get(shopEntityId);
  if (!shopInfo) return state;

  // Only process if the shop entity belongs to the player
  if (shopInfo.controller !== state.player.playerId) return state;

  // Find all entities currently in the SHOP zone belonging to the player
  const shopMinions: GameState['player']['shop']['minions'] = [];

  for (const [entityId, info] of state.player.entityRegistry) {
    if (info.zone === 'SHOP' && info.controller === state.player.playerId) {
      const card = getCardById(info.cardId);
      if (!card) continue;

      // Look up attack/health from the card (these get updated by TAG_CHANGE
      // during the game, but for shop refresh we rebuild from card data)
      // We need to check if there are TAG_CHANGE events for attack/health
      // on this entity — for now, use the card's base values.

      shopMinions.push({
        entityId,
        cardId: info.cardId,
        attack: card.attack ?? 0,
        health: card.health ?? 0,
        taunt: false,
        divineShield: false,
        poisonous: false,
        reborn: false,
        frozen: false,
        tribes: card.race ? [card.race] : [],
      });
    }
  }

  return {
    ...state,
    player: {
      ...state.player,
      shop: {
        ...state.player.shop,
        minions: shopMinions,
      },
    },
  };
}
