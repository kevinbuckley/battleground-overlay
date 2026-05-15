import { describe, expect, it } from 'bun:test';
import type { HsEvent } from '@overlay/log-parser';
import { initialState } from '../initialState';
import { applyDeathrattlesTriggered } from './deathrattlesTriggered';

function makeEvent(tag: string, value: string, entity = '0'): HsEvent {
  return {
    kind: 'TAG_CHANGE',
    entity,
    tag,
    value,
  };
}

describe('applyDeathrattlesTriggered', () => {
  it('initial value is 0', () => {
    const state = initialState();
    expect(state.player.deathrattlesTriggeredThisTurn).toBe(0);
  });

  it('updates on player NUM_DEATHRATTLES_TRIGGERED_THIS_TURN', () => {
    const state = initialState();
    const event = makeEvent('NUM_DEATHRATTLES_TRIGGERED_THIS_TURN', '3');
    const result = applyDeathrattlesTriggered(state, event);
    expect(result.player.deathrattlesTriggeredThisTurn).toBe(3);
  });

  it('no-op on opponent entity', () => {
    const state = initialState();
    const event = makeEvent('NUM_DEATHRATTLES_TRIGGERED_THIS_TURN', '3', '1');
    const result = applyDeathrattlesTriggered(state, event);
    expect(result.player.deathrattlesTriggeredThisTurn).toBe(0);
  });

  it('no-op on non-player entity', () => {
    const state = initialState();
    const event = makeEvent('NUM_DEATHRATTLES_TRIGGERED_THIS_TURN', '3', '99');
    const result = applyDeathrattlesTriggered(state, event);
    expect(result.player.deathrattlesTriggeredThisTurn).toBe(0);
  });
});
