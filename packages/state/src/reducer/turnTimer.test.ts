import { describe, expect, it } from 'bun:test';
import { initialState } from '../initialState';
import { applyTurnTimer } from './turnTimer';

describe('applyTurnTimer', () => {
  it('initial value is 15', () => {
    const state = initialState();
    expect(state.player.turnTimer).toBe(15);
  });

  it('updates turnTimer on player controller TIMEOUT', () => {
    const state = initialState();
    const event = {
      kind: 'TAG_CHANGE',
      entity: String(state.player.entityId),
      tag: 'TIMEOUT',
      value: '10',
    } as const;
    const result = applyTurnTimer(state, event);
    expect(result.player.turnTimer).toBe(10);
  });

  it('no-op on opponent controller', () => {
    const state = initialState();
    const event = {
      kind: 'TAG_CHANGE',
      entity: '999',
      tag: 'TIMEOUT',
      value: '5',
    } as const;
    const result = applyTurnTimer(state, event);
    expect(result.player.turnTimer).toBe(15);
  });

  it('no-op on non-TIMEOUT tag', () => {
    const state = initialState();
    const event = {
      kind: 'TAG_CHANGE',
      entity: String(state.player.entityId),
      tag: 'HEALTH',
      value: '30',
    } as const;
    const result = applyTurnTimer(state, event);
    expect(result.player.turnTimer).toBe(15);
  });
});
