import { describe, expect, it } from 'bun:test';
import { initialState } from '../initialState';
import { applyTrinket } from './trinket';

describe('applyTrinket', () => {
  it('adds a trinket entity to player hand when TRINKET=1 on player controller', () => {
    const state = initialState();
    const registry = new Map(state.player.entityRegistry);
    registry.set(1, { cardId: 'Hero_Garados', zone: 'PLAY', controller: 1 });
    registry.set(2, { cardId: 'TrinketCard', zone: 'HAND', controller: 1 });

    const baseState = {
      ...state,
      player: {
        ...state.player,
        entityId: 0,
        playerId: 0,
        hero: { entityId: 0, cardId: '', hp: 40, armor: 0 },
        board: { minions: [] },
        shop: { minions: [], frozen: false, rollCost: 1 },
        hand: [],
        gold: 0,
        tier: 1,
        tierUpCost: 6,
        eliminated: false,
        pendingTriple: null,
        heroPowerUsedThisTurn: false,
        handSize: 0,
        trinketUsed: false,
        entityRegistry: registry,
      },
    };

    const event = {
      kind: 'TAG_CHANGE',
      entity: '2',
      tag: 'TRINKET',
      value: '1',
    } as const;

    const result = applyTrinket(baseState, event);

    expect(result.player.hand).toEqual([3]);
    expect(result.player.trinketUsed).toBe(true);
  });

  it('sets trinketUsed flag to true', () => {
    const state = initialState();
    const registry = new Map(state.player.entityRegistry);
    registry.set(5, { cardId: 'TestTrinket', zone: 'HAND', controller: 1 });

    const baseState = {
      ...state,
      player: {
        ...state.player,
        entityId: 0,
        playerId: 0,
        hero: { entityId: 0, cardId: '', hp: 40, armor: 0 },
        board: { minions: [] },
        shop: { minions: [], frozen: false, rollCost: 1 },
        hand: [],
        gold: 0,
        tier: 1,
        tierUpCost: 6,
        eliminated: false,
        pendingTriple: null,
        heroPowerUsedThisTurn: false,
        handSize: 0,
        trinketUsed: false,
        entityRegistry: registry,
      },
    };

    const event = {
      kind: 'TAG_CHANGE',
      entity: '5',
      tag: 'TRINKET',
      value: '1',
    } as const;

    const result = applyTrinket(baseState, event);
    expect(result.player.trinketUsed).toBe(true);
  });

  it('is a no-op when the entity is not on the player controller', () => {
    const state = initialState();
    const registry = new Map(state.player.entityRegistry);
    registry.set(10, { cardId: 'OpponentTrinket', zone: 'HAND', controller: 2 });

    const baseState = {
      ...state,
      player: {
        ...state.player,
        entityId: 0,
        playerId: 0,
        hero: { entityId: 0, cardId: '', hp: 40, armor: 0 },
        board: { minions: [] },
        shop: { minions: [], frozen: false, rollCost: 1 },
        hand: [],
        gold: 0,
        tier: 1,
        tierUpCost: 6,
        eliminated: false,
        pendingTriple: null,
        heroPowerUsedThisTurn: false,
        handSize: 0,
        trinketUsed: false,
        entityRegistry: registry,
      },
    };

    const event = {
      kind: 'TAG_CHANGE',
      entity: '10',
      tag: 'TRINKET',
      value: '1',
    } as const;

    const result = applyTrinket(baseState, event);
    expect(result).toBe(baseState);
  });

  it('is a no-op when TRINKET value is 0', () => {
    const state = initialState();
    const registry = new Map(state.player.entityRegistry);
    registry.set(3, { cardId: 'TestTrinket', zone: 'HAND', controller: 1 });

    const baseState = {
      ...state,
      player: {
        ...state.player,
        entityId: 0,
        playerId: 0,
        hero: { entityId: 0, cardId: '', hp: 40, armor: 0 },
        board: { minions: [] },
        shop: { minions: [], frozen: false, rollCost: 1 },
        hand: [],
        gold: 0,
        tier: 1,
        tierUpCost: 6,
        eliminated: false,
        pendingTriple: null,
        heroPowerUsedThisTurn: false,
        handSize: 0,
        trinketUsed: true,
        entityRegistry: registry,
      },
    };

    const event = {
      kind: 'TAG_CHANGE',
      entity: '3',
      tag: 'TRINKET',
      value: '0',
    } as const;

    const result = applyTrinket(baseState, event);
    expect(result).toBe(baseState);
  });
});
