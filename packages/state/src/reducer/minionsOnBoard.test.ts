import { describe, expect, it } from 'bun:test';
import type { HsEvent } from '@overlay/log-parser';
import { initialState } from '../initialState';
import { applyMinionsOnBoard } from './minionsOnBoard';

function makeEvent(tag: string, entity: string, value: string): HsEvent {
  return {
    kind: 'TAG_CHANGE',
    entity,
    tag,
    value,
  };
}

describe('applyMinionsOnBoard', () => {
  it('initial state has minionsOnBoard = 0', () => {
    const state = initialState();
    expect(state.player.minionsOnBoard).toBe(0);
  });

  it('updates minionsOnBoard when tag matches player entity', () => {
    const state = initialState();
    const event = makeEvent('NUM_MINIONS_ON_BOARD', String(state.player.entityId), '3');
    const result = applyMinionsOnBoard(state, event);
    expect(result.player.minionsOnBoard).toBe(3);
  });

  it('no-op when entity does not match player', () => {
    const state = initialState();
    const event = makeEvent('NUM_MINIONS_ON_BOARD', '999', '5');
    const result = applyMinionsOnBoard(state, event);
    expect(result).toBe(state);
  });

  it('no-op when tag is not NUM_MINIONS_ON_BOARD', () => {
    const state = initialState();
    const event = makeEvent('HEALTH', String(state.player.entityId), '30');
    const result = applyMinionsOnBoard(state, event);
    expect(result).toBe(state);
  });
});
