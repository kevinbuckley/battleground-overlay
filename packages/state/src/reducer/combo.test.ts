import { describe, expect, it } from 'bun:test';
import type { HsEvent } from '@overlay/log-parser';
import { initialState } from '../initialState';
import { applyCombo } from './combo';

function makeEvent(tag: string, entity: string, value: string): HsEvent {
  return {
    kind: 'TAG_CHANGE',
    entity,
    tag,
    value,
  };
}

describe('applyCombo', () => {
  it('initial state has combo = 0', () => {
    const state = initialState();
    expect(state.player.combo).toBe(0);
  });

  it('updates combo when tag matches player entity', () => {
    const state = initialState();
    const event = makeEvent('COMBO', String(state.player.entityId), '2');
    const result = applyCombo(state, event);
    expect(result.player.combo).toBe(2);
  });

  it('no-op when entity does not match player', () => {
    const state = initialState();
    const event = makeEvent('COMBO', '999', '5');
    const result = applyCombo(state, event);
    expect(result).toBe(state);
  });

  it('no-op when tag is not COMBO', () => {
    const state = initialState();
    const event = makeEvent('HEALTH', String(state.player.entityId), '30');
    const result = applyCombo(state, event);
    expect(result).toBe(state);
  });
});
