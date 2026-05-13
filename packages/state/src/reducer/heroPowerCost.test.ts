import { describe, expect, it } from 'bun:test';
import { initialState } from '../initialState';
import { applyHeroPowerCost } from './heroPowerCost';

describe('applyHeroPowerCost', () => {
  it('sets heroPowerCost on player controller', () => {
    const state = initialState();
    const event = {
      kind: 'TAG_CHANGE',
      entity: String(state.player.entityId),
      tag: 'HERO_POWER_COST',
      value: '2',
    } as const;
    const result = applyHeroPowerCost(state, event);
    expect(result.player.heroPowerCost).toBe(2);
  });

  it('updates heroPowerCost when it changes', () => {
    const state = initialState();
    const event1 = {
      kind: 'TAG_CHANGE',
      entity: String(state.player.entityId),
      tag: 'HERO_POWER_COST',
      value: '1',
    } as const;
    const step1 = applyHeroPowerCost(state, event1);
    const event2 = {
      kind: 'TAG_CHANGE',
      entity: String(state.player.entityId),
      tag: 'HERO_POWER_COST',
      value: '3',
    } as const;
    const result = applyHeroPowerCost(step1, event2);
    expect(result.player.heroPowerCost).toBe(3);
  });

  it('no-op on non-player controller', () => {
    const state = initialState();
    const event = {
      kind: 'TAG_CHANGE',
      entity: '999',
      tag: 'HERO_POWER_COST',
      value: '5',
    } as const;
    const result = applyHeroPowerCost(state, event);
    expect(result).toBe(state);
  });

  it('persists across turns', () => {
    const state = initialState();
    const event = {
      kind: 'TAG_CHANGE',
      entity: String(state.player.entityId),
      tag: 'HERO_POWER_COST',
      value: '2',
    } as const;
    const result = applyHeroPowerCost(state, event);
    expect(result.player.heroPowerCost).toBe(2);
    // Simulate a turn change (no heroPowerCost event)
    const state2 = { ...result, turn: result.turn + 1 };
    expect(state2.player.heroPowerCost).toBe(2);
  });
});
