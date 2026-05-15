import { describe, expect, it } from 'bun:test';
import { initialState } from '../initialState';
import { applyNumGameTurns } from './numGameTurns';

function makeEvent(value: string, entity?: string) {
  return {
    kind: 'TAG_CHANGE',
    entity: entity ?? '0',
    tag: 'NUM_GAME_TURNS',
    value,
  } as const;
}

describe('applyNumGameTurns', () => {
  it('initial state has numGameTurns = 0', () => {
    expect(initialState().player.numGameTurns).toBe(0);
  });

  it('updates numGameTurns on player controller', () => {
    const state = initialState();
    const result = applyNumGameTurns(state, makeEvent('5'));
    expect(result.player.numGameTurns).toBe(5);
  });

  it('no-op on opponent controller', () => {
    const state = initialState();
    const result = applyNumGameTurns(state, makeEvent('5', '99'));
    expect(result.player.numGameTurns).toBe(0);
  });

  it('no-op on non-PLAYER_GAME_TURNS tag', () => {
    const state = initialState();
    const result = applyNumGameTurns(state, {
      kind: 'TAG_CHANGE',
      entity: '0',
      tag: 'HEALTH',
      value: '5',
    } as never);
    expect(result.player.numGameTurns).toBe(0);
  });
});
