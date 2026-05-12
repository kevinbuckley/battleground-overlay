import { describe, expect, it } from 'bun:test';
import type { HsEvent } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';
import { initialState } from '../initialState';
import { applyHandSize } from './handSize';

function makeEvent(overrides: Partial<HsEvent & { kind: 'TAG_CHANGE' }>): HsEvent {
  return {
    kind: 'TAG_CHANGE',
    entity: '1',
    tag: 'NUM_CARDS_IN_HAND',
    value: '3',
    ...overrides,
  } as HsEvent;
}

describe('applyHandSize', () => {
  it('sets handSize when tag matches player entity', () => {
    const state: GameState = {
      ...initialState(),
      player: { ...initialState().player, entityId: 1 },
    };
    const event = makeEvent({ entity: '1', value: '3' });
    const result = applyHandSize(state, event);
    expect(result.player.handSize).toBe(3);
  });

  it('increments handSize when value changes', () => {
    const state: GameState = {
      ...initialState(),
      player: { ...initialState().player, entityId: 1, handSize: 3 },
    };
    const event = makeEvent({ entity: '1', value: '5' });
    const result = applyHandSize(state, event);
    expect(result.player.handSize).toBe(5);
  });

  it('decrements handSize when value drops', () => {
    const state: GameState = {
      ...initialState(),
      player: { ...initialState().player, entityId: 1, handSize: 5 },
    };
    const event = makeEvent({ entity: '1', value: '2' });
    const result = applyHandSize(state, event);
    expect(result.player.handSize).toBe(2);
  });

  it('is no-op on wrong entity', () => {
    const state: GameState = {
      ...initialState(),
      player: { ...initialState().player, entityId: 1 },
    };
    const event = makeEvent({ entity: '99', value: '10' });
    const result = applyHandSize(state, event);
    expect(result).toBe(state);
  });
});
