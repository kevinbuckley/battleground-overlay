import { describe, expect, it } from 'bun:test';
import type { TagChange } from '@overlay/log-parser';
import { initialState } from '../initialState';
import { applyNumMinionsTraded } from './numMinionsTraded';

function makeEvent(value: string, entityId = '0'): TagChange {
  return {
    kind: 'TAG_CHANGE',
    entity: entityId,
    tag: 'NUM_MINIONS_TRADED_THIS_TURN',
    value,
  };
}

describe('applyNumMinionsTraded', () => {
  it('initial value is 0', () => {
    const state = initialState();
    expect(state.player.minionsTradedThisTurn).toBe(0);
  });

  it('updates on matching player entity', () => {
    const state = initialState();
    const event = makeEvent('3');
    const result = applyNumMinionsTraded(state, event);
    expect(result.player.minionsTradedThisTurn).toBe(3);
  });

  it('no-op on opponent entity', () => {
    const state = initialState();
    const event = makeEvent('3', '99');
    const result = applyNumMinionsTraded(state, event);
    expect(result.player.minionsTradedThisTurn).toBe(0);
  });

  it('reflected in state after update', () => {
    const state = initialState();
    const event = makeEvent('5');
    const result = applyNumMinionsTraded(state, event);
    expect(result.player.minionsTradedThisTurn).toBe(5);
  });
});
