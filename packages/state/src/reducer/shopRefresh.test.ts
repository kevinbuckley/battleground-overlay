import { describe, expect, it } from 'bun:test';
import type { ZoneChangeList } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';
import { initialState } from '../initialState';
import { applyShopRefresh } from './shopRefresh';
import { applyShopRefreshFromZonePlay } from './shopRefresh';

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

  it('adds a visible tavern card from HAS_DRAG_TO_BUY', () => {
    const base = initialState();
    const state: GameState = {
      ...base,
      player: {
        ...base.player,
        playerId: 6,
        entityRegistry: new Map([[200, { cardId: '', zone: 'PLAY', controller: 14 }]]),
      },
    };

    const result = applyShopRefreshFromZonePlay(state, {
      kind: 'TAG_CHANGE',
      entity: '200',
      entityRaw: '[entityName=Shop Minion id=200 zone=PLAY zonePos=1 cardId=BG_TEST_MINION player=14]',
      tag: 'HAS_DRAG_TO_BUY',
      value: '1',
    });

    expect(result.player.shop.minions).toHaveLength(1);
    expect(result.player.shop.minions[0]?.entityId).toBe(200);
    expect(result.player.shop.minions[0]?.cardId).toBe('BG_TEST_MINION');
    expect(result.player.entityRegistry.get(200)?.zonePos).toBe(1);
  });

  it('does not treat local SETASIDE to PLAY board returns as shop cards', () => {
    const base = initialState();
    const state: GameState = {
      ...base,
      player: {
        ...base.player,
        playerId: 6,
        entityRegistry: new Map([[201, { cardId: 'BG_TEST_MINION_2', zone: 'SETASIDE', controller: 6 }]]),
      },
    };

    const result = applyShopRefreshFromZonePlay(state, {
      kind: 'TAG_CHANGE',
      entity: '201',
      entityRaw: '[entityName=Board Minion id=201 zone=SETASIDE zonePos=0 cardId=BG_TEST_MINION_2 player=6]',
      tag: 'ZONE',
      value: 'PLAY',
    });

    expect(result.player.shop.minions).toEqual([]);
    expect(result.player.entityRegistry.get(201)?.controller).toBe(6);
  });

  it('preserves descriptor player when controller tag has not arrived yet', () => {
    const base = initialState();
    const state: GameState = {
      ...base,
      player: {
        ...base.player,
        playerId: 6,
        entityRegistry: new Map([[202, { cardId: '', zone: 'PLAY', controller: 0 }]]),
      },
    };

    const result = applyShopRefreshFromZonePlay(state, {
      kind: 'TAG_CHANGE',
      entity: '202',
      entityRaw: '[entityName=Shop Minion id=202 zone=PLAY zonePos=1 cardId=BG_TEST_MINION_3 player=14]',
      tag: 'HAS_DRAG_TO_BUY',
      value: '1',
    });

    expect(result.player.shop.minions).toHaveLength(1);
    expect(result.player.entityRegistry.get(202)?.controller).toBe(14);
  });

  it('removes a tracked shop minion when it leaves PLAY', () => {
    const base = initialState();
    const state: GameState = {
      ...base,
      player: {
        ...base.player,
        playerId: 6,
        entityRegistry: new Map([
          [
            203,
            {
              cardId: 'BG_TEST_MINION_4',
              zone: 'PLAY',
              controller: 14,
              hasDragToBuy: true,
            },
          ],
        ]),
        shop: {
          ...base.player.shop,
          minions: [
            {
              entityId: 203,
              cardId: 'BG_TEST_MINION_4',
              attack: 1,
              health: 1,
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
              cost: 0,
              tribes: [],
              spellPower: 0,
              exhausted: false,
              magnetic: false,
              immune: false,
              charge: false,
            },
          ],
        },
      },
    };

    const result = applyShopRefreshFromZonePlay(state, {
      kind: 'TAG_CHANGE',
      entity: '203',
      entityRaw: '[entityName=Shop Minion id=203 zone=PLAY zonePos=1 cardId=BG_TEST_MINION_4 player=14]',
      tag: 'ZONE',
      value: 'SETASIDE',
    });

    expect(result.player.shop.minions).toEqual([]);
    expect(result.player.entityRegistry.get(203)?.zone).toBe('SETASIDE');
  });

  it('removes a tracked shop minion when HAS_DRAG_TO_BUY is cleared', () => {
    const base = initialState();
    const state: GameState = {
      ...base,
      player: {
        ...base.player,
        playerId: 6,
        entityRegistry: new Map([
          [
            204,
            {
              cardId: 'BG_OLD',
              zone: 'PLAY',
              controller: 14,
              zonePos: 2,
              hasDragToBuy: true,
            },
          ],
        ]),
        shop: {
          ...base.player.shop,
          minions: [
            {
              entityId: 204,
              cardId: 'BG_OLD',
              attack: 1,
              health: 1,
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
              cost: 0,
              tribes: [],
              spellPower: 0,
              exhausted: false,
              magnetic: false,
              immune: false,
              charge: false,
            },
          ],
        },
      },
    };

    const result = applyShopRefreshFromZonePlay(state, {
      kind: 'TAG_CHANGE',
      entity: '204',
      entityRaw: '[entityName=Shop Minion id=204 zone=PLAY zonePos=2 cardId=BG_OLD player=14]',
      tag: 'HAS_DRAG_TO_BUY',
      value: '0',
    });

    expect(result.player.shop.minions).toEqual([]);
  });
});
