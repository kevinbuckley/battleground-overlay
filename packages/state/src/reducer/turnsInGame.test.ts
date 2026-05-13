import { describe, expect, it } from 'bun:test';
import type { HsEvent } from '@overlay/log-parser';
import { initialState } from '../initialState';
import { applyTurnsInGame } from './turnsInGame';

function makeEvent(tag: string, entity: string, value: string): HsEvent {
  return { kind: 'TAG_CHANGE', tag, entity, value };
}

describe('applyTurnsInGame', () => {
  it('sets turnsInGame when NUM_TURNS_IN_GAME on player controller', () => {
    const state = initialState();
    const event = makeEvent('NUM_TURNS_IN_GAME', String(state.player.entityId), '5');
    const result = applyTurnsInGame(state, event);
    expect(result.player.turnsInGame).toBe(5);
  });

  it('initial state has turnsInGame = 0', () => {
    const state = initialState();
    expect(state.player.turnsInGame).toBe(0);
  });

  it('no-op when tag is not NUM_TURNS_IN_GAME', () => {
    const state = initialState();
    const event = makeEvent('HEALTH', String(state.player.entityId), '30');
    const result = applyTurnsInGame(state, event);
    expect(result).toBe(state);
  });

  it('no-op when entity is not player controller', () => {
    const state = initialState();
    const event = makeEvent('NUM_TURNS_IN_GAME', '999', '5');
    const result = applyTurnsInGame(state, event);
    expect(result).toBe(state);
  });
});
