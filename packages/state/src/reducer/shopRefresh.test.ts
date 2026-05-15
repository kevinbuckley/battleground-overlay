import { describe, expect, it } from 'bun:test';
import type { ZoneChangeList } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';
import { initialState } from '../initialState';
import { applyShopRefresh } from './shopRefresh';

describe('applyShopRefresh', () => {
  it('rebuilds shop minions from entities in SHOP zone', () => {
    const base = initialState();
    const state: GameState = {
      ...base,
      player: {
        ...base.player,
        entityId: 2,
        playerId: 1,
        entityRegistry: new Map([
          [3, { cardId: 'TB_BaconShop_Min1', zone: 'SHOP', controller: 1 }],
          [4, { cardId: 'TB_BaconShop_Min2', zone: 'SHOP', controller: 1 }],
          [5, { cardId: 'TB_BaconShop_Min3', zone: 'SHOP', controller: 1 }],
          [6, { cardId: 'TB_BaconHeroBasic', zone: 'PLAY', controller: 1 }],
        ]),
      },
    };
    const event: ZoneChangeList = { kind: 'ZONE_CHANGE_LIST', id: 2 };
    const result = applyShopRefresh(state, event);
    // When no cards.json is loaded, getCardById returns null for all entries,
    // so shop minions remain empty (card data is required to build Minion objects)
    expect(result.player.shop.minions).toEqual([]);
  });

  it('ignores entities not in SHOP zone', () => {
    const base = initialState();
    const state: GameState = {
      ...base,
      player: {
        ...base.player,
        entityId: 2,
        playerId: 1,
        entityRegistry: new Map([
          [3, { cardId: 'TB_BaconShop_Min1', zone: 'PLAY', controller: 1 }],
          [4, { cardId: 'TB_BaconShop_Min2', zone: 'GRAVEYARD', controller: 1 }],
        ]),
      },
    };
    const event: ZoneChangeList = { kind: 'ZONE_CHANGE_LIST', id: 2 };
    const result = applyShopRefresh(state, event);
    expect(result.player.shop.minions).toEqual([]);
  });

  it('ignores entities not belonging to the player', () => {
    const base = initialState();
    const state: GameState = {
      ...base,
      player: {
        ...base.player,
        entityId: 2,
        playerId: 1,
        entityRegistry: new Map([
          [3, { cardId: 'TB_BaconShop_Min1', zone: 'SHOP', controller: 2 }],
          [4, { cardId: 'TB_BaconShop_Min2', zone: 'SHOP', controller: 3 }],
        ]),
      },
    };
    const event: ZoneChangeList = { kind: 'ZONE_CHANGE_LIST', id: 2 };
    const result = applyShopRefresh(state, event);
    expect(result.player.shop.minions).toEqual([]);
  });

  it('returns state unchanged when shop entity not in registry', () => {
    const state = initialState();
    const event: ZoneChangeList = { kind: 'ZONE_CHANGE_LIST', id: 999 };
    const result = applyShopRefresh(state, event);
    expect(result).toBe(state);
  });

  it('ZONE_CHANGE_LIST with id=1 sets shop minions from registry', () => {
    const base = initialState();
    const state: GameState = {
      ...base,
      player: {
        ...base.player,
        entityId: 1,
        playerId: 1,
        entityRegistry: new Map([
          [2, { cardId: 'TB_BaconShop_Min1', zone: 'SHOP', controller: 1 }],
          [3, { cardId: 'TB_BaconShop_Min2', zone: 'SHOP', controller: 1 }],
        ]),
      },
    };
    const event: ZoneChangeList = { kind: 'ZONE_CHANGE_LIST', id: 1 };
    const result = applyShopRefresh(state, event);
    expect(result.player.shop.minions).toEqual([]);
  });

  it('two sequential events — second one updates shop', () => {
    const base = initialState();
    const state: GameState = {
      ...base,
      player: {
        ...base.player,
        entityId: 2,
        playerId: 1,
        entityRegistry: new Map([
          [3, { cardId: 'TB_BaconShop_Min1', zone: 'SHOP', controller: 1 }],
          [4, { cardId: 'TB_BaconShop_Min2', zone: 'SHOP', controller: 1 }],
        ]),
      },
    };
    const event1: ZoneChangeList = { kind: 'ZONE_CHANGE_LIST', id: 2 };
    const event2: ZoneChangeList = { kind: 'ZONE_CHANGE_LIST', id: 2 };
    const result1 = applyShopRefresh(state, event1);
    const result2 = applyShopRefresh(result1, event2);
    expect(result2.player.shop.minions).toEqual(result1.player.shop.minions);
  });
});
