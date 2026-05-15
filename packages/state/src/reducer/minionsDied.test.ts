import { describe, expect, it } from 'bun:test';
import type { TagChange } from '@overlay/log-parser';
import { initialState } from '../initialState';
import { applyMinionsDied } from './minionsDied';

function makeEvent(value: string): TagChange {
  return { kind: 'TAG_CHANGE', entity: '0', tag: 'NUM_MINIONS_DIED_THIS_TURN', value };
}

describe('applyMinionsDied', () => {
  it('initial value is 0', () => {
    const state = initialState();
    expect(state.player.minionsDiedThisTurn).toBe(0);
  });

  it('updates on matching TAG_CHANGE', () => {
    const state = initialState();
    const event = makeEvent('3');
    const result = applyMinionsDied(state, event);
    expect(result.player.minionsDiedThisTurn).toBe(3);
  });

  it('no-op on opponent entity', () => {
    const state = initialState();
    const event = { ...makeEvent('5'), entity: '99' };
    const result = applyMinionsDied(state, event);
    expect(result).toBe(state);
  });

  it('reflected in state', () => {
    const state = initialState();
    const event = makeEvent('7');
    const result = applyMinionsDied(state, event);
    expect(result.player.minionsDiedThisTurn).toBe(7);
  });
});
