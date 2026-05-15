import { describe, expect, it } from 'bun:test';
import { initialState } from '../initialState';
import { applyVictories } from './victories';

describe('applyVictories', () => {
  it('initial=0', () => {
    const state = initialState();
    const result = applyVictories(state, {
      kind: 'TAG_CHANGE',
      entity: String(state.player.entityId),
      tag: 'NUM_VICTORIES',
      value: '0',
    });
    expect(result.player.victories).toBe(0);
  });

  it('increments on victory', () => {
    const state = initialState();
    const result = applyVictories(state, {
      kind: 'TAG_CHANGE',
      entity: String(state.player.entityId),
      tag: 'NUM_VICTORIES',
      value: '5',
    });
    expect(result.player.victories).toBe(5);
  });

  it('no-op on opponent', () => {
    const state = initialState();
    const result = applyVictories(state, {
      kind: 'TAG_CHANGE',
      entity: '999',
      tag: 'NUM_VICTORIES',
      value: '10',
    });
    expect(result.player.victories).toBe(0);
  });

  it('reflected in state', () => {
    const state = initialState();
    const result = applyVictories(state, {
      kind: 'TAG_CHANGE',
      entity: String(state.player.entityId),
      tag: 'NUM_VICTORIES',
      value: '12',
    });
    expect(result.player.victories).toBe(12);
  });
});
