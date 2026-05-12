import { describe, expect, it } from 'bun:test';
import type { HsEvent } from '@overlay/log-parser';
import { initialState } from '../initialState';
import { applyLobbySize } from './lobbySize';

function tagChange(entity: string, tag: string, value: string): HsEvent {
  return { kind: 'TAG_CHANGE', entity, tag, value };
}

describe('applyLobbySize', () => {
  it('sets lobbySize when NUM_MINIONS_IN_LOBBY changes on player', () => {
    const state = initialState();
    const event = tagChange('0', 'NUM_MINIONS_IN_LOBBY', '7');
    const result = applyLobbySize(state, event);
    expect(result.lobbySize).toBe(7);
  });

  it('ignores NUM_MINIONS_IN_LOBBY on non-player entity', () => {
    const state = { ...initialState(), player: { ...initialState().player, entityId: 1 } };
    const event = tagChange('0', 'NUM_MINIONS_IN_LOBBY', '7');
    const result = applyLobbySize(state, event);
    expect(result.lobbySize).toBe(8);
  });

  it('ignores non-NUM_MINIONS_IN_LOBBY tags', () => {
    const state = initialState();
    const event = tagChange('0', 'HEALTH', '35');
    const result = applyLobbySize(state, event);
    expect(result.lobbySize).toBe(8);
  });

  it('ignores non-TAG_CHANGE events', () => {
    const state = initialState();
    const event = {
      kind: 'BLOCK_START',
      blockType: 'TRIGGER',
      entity: '0',
      effectCardId: '',
      effectIndex: 0,
      target: '',
      subOption: '',
      triggerKeyword: '',
    };
    const result = applyLobbySize(state, event as HsEvent);
    expect(result.lobbySize).toBe(8);
  });
});
