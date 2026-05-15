import { describe, expect, it } from 'bun:test';
import { initialState } from '../initialState';
import { applyRevives } from './revives';

describe('applyRevives', () => {
  it('initial=0', () => {
    const state = initialState();
    const result = applyRevives(state, {
      kind: 'TAG_CHANGE',
      entity: String(state.player.entityId),
      tag: 'NUM_REVIVES',
      value: '0',
    });
    expect(result.player.revives).toBe(0);
  });

  it('increments on revive', () => {
    const state = initialState();
    const result = applyRevives(state, {
      kind: 'TAG_CHANGE',
      entity: String(state.player.entityId),
      tag: 'NUM_REVIVES',
      value: '3',
    });
    expect(result.player.revives).toBe(3);
  });

  it('no-op on opponent', () => {
    const state = initialState();
    const result = applyRevives(state, {
      kind: 'TAG_CHANGE',
      entity: '999',
      tag: 'NUM_REVIVES',
      value: '5',
    });
    expect(result.player.revives).toBe(0);
  });

  it('no-op on non-player entity', () => {
    const state = initialState();
    const result = applyRevives(state, {
      kind: 'TAG_CHANGE',
      entity: '999',
      tag: 'NUM_REVIVES',
      value: '2',
    });
    expect(result.player.revives).toBe(0);
  });
});
