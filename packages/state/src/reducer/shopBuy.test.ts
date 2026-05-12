import { describe, expect, it } from 'bun:test';
import type { HsEvent } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';
import { initialState } from '../initialState';
import { applyShopBuy } from './shopBuy';

describe('applyShopBuy', () => {
  it('moves a minion from shop to board when ZONE changes from SHOP to PLAY', () => {
    const base = initialState();
    const state: GameState = {
      ...base,
      player: {
        ...base.player,
        entityId: 2,
        playerId: 1,
        board: {
          minions: [],
        },
        shop: {
          minions: [
            {
              entityId: 3,
              cardId: 'TB_BaconShop_Min1',
              attack: 1,
              health: 2,
              taunt: false,
              divineShield: false,
              poisonous: false,
              reborn: false,
              frozen: false,
              tribes: ['Pirate'],
            },
          ],
          frozen: false,
          rollCost: 3,
        },
        entityRegistry: new Map([
          [3, { cardId: 'TB_BaconShop_Min1', zone: 'SHOP', controller: 1 }],
        ]),
      },
    };

    const event: HsEvent = {
      kind: 'TAG_CHANGE',
      entity: '3',
      tag: 'ZONE',
      value: 'PLAY',
    };

    const result = applyShopBuy(state, event);

    // Minion should be removed from shop
    expect(result.player.shop.minions).toEqual([]);
    // Minion should be added to board
    expect(result.player.board.minions).toHaveLength(1);
    expect(result.player.board.minions[0].entityId).toBe(3);
    expect(result.player.board.minions[0].cardId).toBe('TB_BaconShop_Min1');
    // Without card data loaded, tribes defaults to empty array
    expect(result.player.board.minions[0].tribes).toEqual([]);
  });

  it('ignores TAG_CHANGE events that are not ZONE', () => {
    const base = initialState();
    const state: GameState = {
      ...base,
      player: {
        ...base.player,
        entityId: 2,
        playerId: 1,
        board: { minions: [] },
        shop: {
          minions: [
            {
              entityId: 3,
              cardId: 'TB_BaconShop_Min1',
              attack: 1,
              health: 2,
              taunt: false,
              divineShield: false,
              poisonous: false,
              reborn: false,
              frozen: false,
              tribes: [],
            },
          ],
          frozen: false,
          rollCost: 3,
        },
        entityRegistry: new Map(),
      },
    };

    const event: HsEvent = {
      kind: 'TAG_CHANGE',
      entity: '3',
      tag: 'ATTACK',
      value: '3',
    };

    const result = applyShopBuy(state, event);
    expect(result).toBe(state);
  });

  it('ignores ZONE changes that do not go to PLAY', () => {
    const base = initialState();
    const state: GameState = {
      ...base,
      player: {
        ...base.player,
        entityId: 2,
        playerId: 1,
        board: { minions: [] },
        shop: {
          minions: [
            {
              entityId: 3,
              cardId: 'TB_BaconShop_Min1',
              attack: 1,
              health: 2,
              taunt: false,
              divineShield: false,
              poisonous: false,
              reborn: false,
              frozen: false,
              tribes: [],
            },
          ],
          frozen: false,
          rollCost: 3,
        },
        entityRegistry: new Map(),
      },
    };

    const event: HsEvent = {
      kind: 'TAG_CHANGE',
      entity: '3',
      tag: 'ZONE',
      value: 'GRAVEYARD',
    };

    const result = applyShopBuy(state, event);
    expect(result).toBe(state);
  });

  it('ignores when entity is not in the shop minions list', () => {
    const base = initialState();
    const state: GameState = {
      ...base,
      player: {
        ...base.player,
        entityId: 2,
        playerId: 1,
        board: { minions: [] },
        shop: {
          minions: [],
          frozen: false,
          rollCost: 3,
        },
        entityRegistry: new Map([
          [3, { cardId: 'TB_BaconShop_Min1', zone: 'PLAY', controller: 1 }],
        ]),
      },
    };

    const event: HsEvent = {
      kind: 'TAG_CHANGE',
      entity: '3',
      tag: 'ZONE',
      value: 'PLAY',
    };

    const result = applyShopBuy(state, event);
    expect(result).toBe(state);
  });

  it('ignores entities not belonging to the player', () => {
    const base = initialState();
    const state: GameState = {
      ...base,
      player: {
        ...base.player,
        entityId: 2,
        playerId: 1,
        board: { minions: [] },
        shop: {
          minions: [],
          frozen: false,
          rollCost: 3,
        },
        entityRegistry: new Map([
          [3, { cardId: 'TB_BaconShop_Min1', zone: 'SHOP', controller: 2 }],
        ]),
      },
    };

    const event: HsEvent = {
      kind: 'TAG_CHANGE',
      entity: '3',
      tag: 'ZONE',
      value: 'PLAY',
    };

    const result = applyShopBuy(state, event);
    expect(result).toBe(state);
  });

  it('ignores non-TAG_CHANGE events', () => {
    const state = initialState();
    const event: HsEvent = {
      kind: 'BLOCK_START',
      blockType: 'TRIGGER',
      entity: '1',
      effectCardId: 'TB_BaconShop_StartGame',
      effectIndex: 0,
      target: '1',
      subOption: '',
      triggerKeyword: '',
    };

    const result = applyShopBuy(state, event);
    expect(result).toBe(state);
  });

  it('ignores when entity ID cannot be parsed', () => {
    const state = initialState();
    const event: HsEvent = {
      kind: 'TAG_CHANGE',
      entity: 'not-a-number',
      tag: 'ZONE',
      value: 'PLAY',
    };

    const result = applyShopBuy(state, event);
    expect(result).toBe(state);
  });
});
