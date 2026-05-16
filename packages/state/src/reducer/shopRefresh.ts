import { getCardById } from '@overlay/card-data';
import type { TagChange, ZoneChangeList } from '@overlay/log-parser';
import type { GameState, Minion } from '@overlay/shared';
import { extractEntityId } from '../entityId';
import { applyEntityEvent, type EntityInfo } from '../entityRegistry';

function toShopMinion(entityId: number, info: EntityInfo): Minion {
  const card = getCardById(info.cardId);
  return {
    entityId,
    cardId: info.cardId,
    attack: info.attack ?? card?.attack ?? 0,
    health: info.health ?? card?.health ?? 0,
    taunt: false,
    divineShield: false,
    poisonous: false,
    reborn: false,
    frozen: false,
    golden: false,
    windfury: false,
    cleave: false,
    elite: false,
    lifesteal: false,
    cost: card?.cost ?? 0,
    tribes: card?.race ? [card.race] : [],
    spellPower: 0,
    exhausted: false,
    magnetic: false,
    immune: false,
    charge: false,
  };
}

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
      shopMinions.push(toShopMinion(entityId, info));
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

function isVisibleShopCard(info: EntityInfo): boolean {
  return info.zone === 'PLAY' && info.hasDragToBuy === true && info.cardId.length > 0;
}

function rebuildVisibleShop(
  state: GameState,
  registry: GameState['player']['entityRegistry'],
): GameState {
  const shopMinions = [...registry]
    .filter(([, info]) => isVisibleShopCard(info))
    .sort((a, b) => (a[1].zonePos ?? 0) - (b[1].zonePos ?? 0))
    .map(([entityId, info]) => toShopMinion(entityId, info));

  return {
    ...state,
    player: {
      ...state.player,
      entityRegistry: registry,
      shop: {
        ...state.player.shop,
        minions: shopMinions,
      },
    },
  };
}

export function applyShopRefreshFromZonePlay(state: GameState, event: TagChange): GameState {
  if (event.tag !== 'ZONE' && event.tag !== 'HAS_DRAG_TO_BUY') return state;

  const entityId = extractEntityId(event.entity);
  if (entityId === null) return state;

  const nextRegistry = applyEntityEvent(new Map(state.player.entityRegistry), event);
  const info = nextRegistry.get(entityId);
  if (!info) return state;

  const wasInShop = state.player.shop.minions.some((m) => m.entityId === entityId);
  if (event.tag === 'HAS_DRAG_TO_BUY' || wasInShop || isVisibleShopCard(info)) {
    return rebuildVisibleShop(state, nextRegistry);
  }

  return state;
}
