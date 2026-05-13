import { describe, expect, it } from 'bun:test';
import type { HsEvent } from '@overlay/log-parser';
import { initialState } from '../initialState';
import { applyGoldSpent } from './goldSpent';

function makeEvent(tag: string, entity: string, value: string): HsEvent {
  return {
    kind: 'TAG_CHANGE',
    entity,
    tag,
    value,
  };
}

describe('applyGoldSpent', () => {
  it('initial state has goldSpentThisTurn = 0', () => {
    const state = initialState();
    expect(state.player.goldSpentThisTurn).toBe(0);
  });

  it('updates goldSpentThisTurn when tag matches player entity', () => {
    const state = initialState();
    const event = makeEvent('RESOURCES_USED', String(state.player.entityId), '3');
    const result = applyGoldSpent(state, event);
    expect(result.player.goldSpentThisTurn).toBe(3);
  });

  it('no-op when entity does not match player', () => {
    const state = initialState();
    const event = makeEvent('RESOURCES_USED', '999', '5');
    const result = applyGoldSpent(state, event);
    expect(result).toBe(state);
  });

  it('no-op when tag is not RESOURCES_USED', () => {
    const state = initialState();
    const event = makeEvent('HEALTH', String(state.player.entityId), '30');
    const result = applyGoldSpent(state, event);
    expect(result).toBe(state);
  });
});
