import { describe, expect, it } from 'bun:test';
import { initialState } from '../initialState';
import { applyNumChoices } from './numChoices';

function makeEvent(value: string, entity?: string) {
  return {
    kind: 'TAG_CHANGE',
    entity: entity ?? '0',
    tag: 'NUM_CHOICES',
    value,
  } as const;
}

describe('applyNumChoices', () => {
  it('initial state has numChoices = 0', () => {
    expect(initialState().player.numChoices).toBe(0);
  });

  it('updates numChoices on player controller', () => {
    const state = initialState();
    const result = applyNumChoices(state, makeEvent('3'));
    expect(result.player.numChoices).toBe(3);
  });

  it('no-op on opponent controller', () => {
    const state = initialState();
    const result = applyNumChoices(state, makeEvent('3', '99'));
    expect(result.player.numChoices).toBe(0);
  });

  it('no-op on non-PLAYER_GAME_TURNS tag', () => {
    const state = initialState();
    const result = applyNumChoices(state, {
      kind: 'TAG_CHANGE',
      entity: '0',
      tag: 'HEALTH',
      value: '5',
    } as never);
    expect(result.player.numChoices).toBe(0);
  });
});
