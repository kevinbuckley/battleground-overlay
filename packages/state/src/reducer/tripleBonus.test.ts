import { describe, expect, it } from 'bun:test';
import type { HsEvent } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';
import { initialState } from '../initialState';
import { applyTripleBonus } from './tripleBonus';

describe('applyTripleBonus', () => {
  it('returns null when no triple exists (no matching cardIds)', () => {
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
              attack: 1,
              health: 2,
              taunt: false,
              divineShield: false,
              poisonous: false,
              reborn: false,
              frozen: false,
              tribes: [],
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
        hand: [5],
        shop: {
          minions: [
            {
              entityId: 6,
              cardId: 'TB_BaconShop_Min3',
              attack: 3,
              health: 3,
              taunt: false,
              divineShield: false,
              poisonous: false,
              reborn: false,
              frozen: false,
              tribes: [],
            },
          ],
          frozen: false,
          rollCost: 1,
        },
        entityRegistry: new Map([
          [3, { cardId: 'TB_BaconShop_Min1', zone: 'PLAY', controller: 1 }],
          [4, { cardId: 'TB_BaconShop_Min2', zone: 'PLAY', controller: 1 }],
          [5, { cardId: 'TB_BaconShop_Min3', zone: 'HAND', controller: 1 }],
          [6, { cardId: 'TB_BaconShop_Min3', zone: 'SHOP', controller: 1 }],
        ]),
      },
    };

    const event: HsEvent = {
      kind: 'TAG_CHANGE',
      entity: '3',
      tag: 'CARDID',
      value: 'TB_BaconShop_Min1',
    };

    const result = applyTripleBonus(state, event);
    expect(result.player.pendingTriple).toBeNull();
  });

  it('sets pendingTriple when 3 identical cardIds exist across board+hand', () => {
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
              attack: 1,
              health: 2,
              taunt: false,
              divineShield: false,
              poisonous: false,
              reborn: false,
              frozen: false,
              tribes: [],
            },
            {
              entityId: 4,
              cardId: 'TB_BaconShop_Min1',
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
        hand: [5],
        shop: {
          minions: [],
          frozen: false,
          rollCost: 1,
        },
        entityRegistry: new Map([
          [3, { cardId: 'TB_BaconShop_Min1', zone: 'PLAY', controller: 1 }],
          [4, { cardId: 'TB_BaconShop_Min1', zone: 'PLAY', controller: 1 }],
          [5, { cardId: 'TB_BaconShop_Min1', zone: 'HAND', controller: 1 }],
        ]),
      },
    };

    const event: HsEvent = {
      kind: 'TAG_CHANGE',
      entity: '5',
      tag: 'CARDID',
      value: 'TB_BaconShop_Min1',
    };

    const result = applyTripleBonus(state, event);
    expect(result.player.pendingTriple).toBe('TB_BaconShop_Min1');
  });

  it('clears pendingTriple when a triple is broken (one minion leaves)', () => {
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
              attack: 1,
              health: 2,
              taunt: false,
              divineShield: false,
              poisonous: false,
              reborn: false,
              frozen: false,
              tribes: [],
            },
            {
              entityId: 4,
              cardId: 'TB_BaconShop_Min1',
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
        hand: [5],
        shop: {
          minions: [],
          frozen: false,
          rollCost: 1,
        },
        pendingTriple: 'TB_BaconShop_Min1',
        entityRegistry: new Map([
          [3, { cardId: 'TB_BaconShop_Min1', zone: 'PLAY', controller: 1 }],
          [4, { cardId: 'TB_BaconShop_Min1', zone: 'PLAY', controller: 1 }],
          [5, { cardId: 'TB_BaconShop_Min1', zone: 'HAND', controller: 1 }],
        ]),
      },
    };

    // Entity 4 changes cardId to something else, breaking the triple
    const event: HsEvent = {
      kind: 'TAG_CHANGE',
      entity: '4',
      tag: 'CARDID',
      value: 'TB_BaconShop_Min2',
    };

    const result = applyTripleBonus(state, event);
    expect(result.player.pendingTriple).toBeNull();
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

    const result = applyTripleBonus(state, event);
    expect(result).toBe(state);
  });

  it('ignores entities not belonging to the player (controller !== 1)', () => {
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
        },
        hand: [],
        shop: { minions: [], frozen: false, rollCost: 1 },
        entityRegistry: new Map([
          [3, { cardId: 'TB_BaconShop_Min1', zone: 'PLAY', controller: 2 }],
        ]),
      },
    };

    const event: HsEvent = {
      kind: 'TAG_CHANGE',
      entity: '3',
      tag: 'CARDID',
      value: 'TB_BaconShop_Min1',
    };

    const result = applyTripleBonus(state, event);
    expect(result).toBe(state);
  });

  it('ignores entities not in PLAY, SHOP, or HAND zones', () => {
    const base = initialState();
    const state: GameState = {
      ...base,
      player: {
        ...base.player,
        entityId: 2,
        playerId: 1,
        board: { minions: [] },
        hand: [],
        shop: { minions: [], frozen: false, rollCost: 1 },
        entityRegistry: new Map([
          [3, { cardId: 'TB_BaconShop_Min1', zone: 'GRAVEYARD', controller: 1 }],
        ]),
      },
    };

    const event: HsEvent = {
      kind: 'TAG_CHANGE',
      entity: '3',
      tag: 'CARDID',
      value: 'TB_BaconShop_Min1',
    };

    const result = applyTripleBonus(state, event);
    expect(result).toBe(state);
  });

  it('ignores when entity ID cannot be parsed', () => {
    const state = initialState();
    const event: HsEvent = {
      kind: 'TAG_CHANGE',
      entity: 'not-a-number',
      tag: 'CARDID',
      value: 'TB_BaconShop_Min1',
    };

    const result = applyTripleBonus(state, event);
    expect(result).toBe(state);
  });

  it('counts shop minions toward triple detection', () => {
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
        },
        hand: [],
        shop: {
          minions: [
            {
              entityId: 4,
              cardId: 'TB_BaconShop_Min1',
              attack: 2,
              health: 3,
              taunt: false,
              divineShield: false,
              poisonous: false,
              reborn: false,
              frozen: false,
              tribes: [],
            },
            {
              entityId: 5,
              cardId: 'TB_BaconShop_Min1',
              attack: 3,
              health: 3,
              taunt: false,
              divineShield: false,
              poisonous: false,
              reborn: false,
              frozen: false,
              tribes: [],
            },
          ],
          frozen: false,
          rollCost: 1,
        },
        entityRegistry: new Map([
          [3, { cardId: 'TB_BaconShop_Min1', zone: 'PLAY', controller: 1 }],
          [4, { cardId: 'TB_BaconShop_Min1', zone: 'SHOP', controller: 1 }],
          [5, { cardId: 'TB_BaconShop_Min1', zone: 'SHOP', controller: 1 }],
        ]),
      },
    };

    const event: HsEvent = {
      kind: 'TAG_CHANGE',
      entity: '3',
      tag: 'CARDID',
      value: 'TB_BaconShop_Min1',
    };

    const result = applyTripleBonus(state, event);
    expect(result.player.pendingTriple).toBe('TB_BaconShop_Min1');
  });
});
