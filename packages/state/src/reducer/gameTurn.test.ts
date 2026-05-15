import { describe, expect, it } from 'bun:test';
import type { TagChange } from '@overlay/log-parser';
import { initialState } from '../initialState';
import { applyGameTurn } from './gameTurn';

function makeEvent(tag: string, entity: string, value: string): TagChange {
  return { kind: 'TAG_CHANGE', tag, entity, value };
}

describe('applyGameTurn', () => {
  it('sets gameTurn on player controller', () => {
    const state = initialState();
    const event = makeEvent('GAME_TURN', String(state.player.entityId), '3');
    const result = applyGameTurn(state, event);
    expect(result.player.gameTurn).toBe(3);
  });

  it('no-op on opponent controller', () => {
    const state = initialState();
    const event = makeEvent('GAME_TURN', '999', '3');
    const result = applyGameTurn(state, event);
    expect(result.player.gameTurn).toBe(1);
  });

  it('no-op on non-GAME_TURN tag', () => {
    const state = initialState();
    const event = makeEvent('HEALTH', String(state.player.entityId), '30');
    const result = applyGameTurn(state, event);
    expect(result.player.gameTurn).toBe(1);
  });

  it('reflected in state', () => {
    const state = initialState();
    const event = makeEvent('GAME_TURN', String(state.player.entityId), '7');
    const result = applyGameTurn(state, event);
    expect(result.player.gameTurn).toBe(7);
  });
});
