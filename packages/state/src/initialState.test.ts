import { describe, expect, it } from 'bun:test';
import { initialState } from './initialState';

describe('initialState', () => {
  it('starts at turn 0 in lobby', () => {
    const state = initialState();
    expect(state.turn).toBe(0);
    expect(state.phase).toBe('lobby');
  });

  it('player starts with empty board and shop', () => {
    const state = initialState();
    expect(state.player.board.minions).toHaveLength(0);
    expect(state.player.shop.minions).toHaveLength(0);
  });

  it('no opponents initially', () => {
    expect(initialState().opponents).toHaveLength(0);
  });
});
