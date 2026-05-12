import { describe, expect, it } from 'bun:test';
import type { HsEvent } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';
import { initialState } from '../initialState';
import { applyShopSell } from './shopSell';

describe('applyShopSell', () => {
  it('removes a minion from the board when ZONE changes to HAND', () => {
    const base = initialState();
    const state: GameState = {
      ...base,
      player: {
        ...base.player,
        entityId: 2,
        playerId: 1,
        board: {
          minions: [
            {
              entityId: 3,
              cardId: 'TB_BaconShop_Min1',
              attack: 3,
              health: 2,
              taunt: false,
              divineShield: false,
              poisonous: false,
              reborn: false,
              frozen: false,
              tribes: ['Pirate'],
            },
            {
              entityId: 4,
              cardId: 'TB_BaconShop_Min2',
              attack: 2,
              health: 3,
              taunt: false,
              divineShield: false,
              poisonous: false,
              reborn: false,
              frozen: false,
              tribes: [],
            },
          ],
        },
        shop: {
          minions: [],
          frozen: false,
          rollCost: 3,
        },
        entityRegistry: new Map([
          [3, { cardId: 'TB_BaconShop_Min1', zone: 'PLAY', controller: 1 }],
          [4, { cardId: 'TB_BaconShop_Min2', zone: 'PLAY', controller: 1 }],
        ]),
      },
    };

    const event: HsEvent = {
      kind: 'TAG_CHANGE',
      entity: '3',
      tag: 'ZONE',
      value: 'HAND',
    };

    const result = applyShopSell(state, event);

    // Minion 3 should be removed from board
    expect(result.player.board.minions).toHaveLength(1);
    expect(result.player.board.minions[0].entityId).toBe(4);
    // Entity registry should be updated
    expect(result.player.entityRegistry.get(3)?.zone).toBe('HAND');
  });

  it('ignores TAG_CHANGE events that are not ZONE', () => {
    const base = initialState();
    const state: GameState = {
      ...base,
      player: {
        ...base.player,
        entityId: 2,
        playerId: 1,
        board: {
          minions: [
            {
              entityId: 3,
              cardId: 'TB_BaconShop_Min1',
              attack: 3,
              health: 2,
              taunt: false,
              divineShield: false,
              poisonous: false,
              reborn: false,
              frozen: false,
              tribes: [],
            },
          ],
        },
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
      tag: 'ATTACK',
      value: '5',
    };

    const result = applyShopSell(state, event);
    expect(result).toBe(state);
  });

  it('ignores ZONE changes that do not go to HAND', () => {
    const base = initialState();
    const state: GameState = {
      ...base,
      player: {
        ...base.player,
        entityId: 2,
        playerId: 1,
        board: {
          minions: [
            {
              entityId: 3,
              cardId: 'TB_BaconShop_Min1',
              attack: 3,
              health: 2,
              taunt: false,
              divineShield: false,
              poisonous: false,
              reborn: false,
              frozen: false,
              tribes: [],
            },
          ],
        },
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
      value: 'GRAVEYARD',
    };

    const result = applyShopSell(state, event);
    expect(result).toBe(state);
  });

  it('ignores when entity is not on the board', () => {
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
          [3, { cardId: 'TB_BaconShop_Min1', zone: 'SHOP', controller: 1 }],
        ]),
      },
    };

    const event: HsEvent = {
      kind: 'TAG_CHANGE',
      entity: '3',
      tag: 'ZONE',
      value: 'HAND',
    };

    const result = applyShopSell(state, event);
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
        board: {
          minions: [
            {
              entityId: 3,
              cardId: 'TB_BaconShop_Min1',
              attack: 3,
              health: 2,
              taunt: false,
              divineShield: false,
              poisonous: false,
              reborn: false,
              frozen: false,
              tribes: [],
            },
          ],
        },
        shop: {
          minions: [],
          frozen: false,
          rollCost: 3,
        },
        entityRegistry: new Map([
          [3, { cardId: 'TB_BaconShop_Min1', zone: 'PLAY', controller: 2 }],
        ]),
      },
    };

    const event: HsEvent = {
      kind: 'TAG_CHANGE',
      entity: '3',
      tag: 'ZONE',
      value: 'HAND',
    };

    const result = applyShopSell(state, event);
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

    const result = applyShopSell(state, event);
    expect(result).toBe(state);
  });

  it('ignores when entity ID cannot be parsed', () => {
    const state = initialState();
    const event: HsEvent = {
      kind: 'TAG_CHANGE',
      entity: 'not-a-number',
      tag: 'ZONE',
      value: 'HAND',
    };

    const result = applyShopSell(state, event);
    expect(result).toBe(state);
  });
});
