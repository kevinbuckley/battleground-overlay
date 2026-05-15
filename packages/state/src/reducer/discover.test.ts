import { describe, expect, it } from 'bun:test';
import { initialState } from '../initialState';
import { applyDiscover } from './discover';

describe('applyDiscover', () => {
  it('sets discoveredCardId on DISCOVER tag for player', () => {
    const state = initialState();
    const event = {
      kind: 'TAG_CHANGE',
      entity: String(state.player.entityId),
      tag: 'DISCOVER',
      value: 'TB_GolBostrum',
    } as const;
    const result = applyDiscover(state, event);
    expect(result.player.discoveredCardId).toBe('TB_GolBostrum');
  });

  it('clears discoveredCardId when value=0', () => {
    const state = initialState();
    const withDiscovery = {
      ...state,
      player: { ...state.player, discoveredCardId: 'TB_GolBostrum' },
    };
    const event = {
      kind: 'TAG_CHANGE',
      entity: String(state.player.entityId),
      tag: 'DISCOVER',
      value: '0',
    } as const;
    const result = applyDiscover(withDiscovery, event);
    expect(result.player.discoveredCardId).toBeNull();
  });

  it('is no-op when tag is on opponent entity', () => {
    const state = initialState();
    const event = {
      kind: 'TAG_CHANGE',
      entity: '999',
      tag: 'DISCOVER',
      value: 'TB_GolBostrum',
    } as const;
    const result = applyDiscover(state, event);
    expect(result.player.discoveredCardId).toBeNull();
  });

  it('persists discoveredCardId across turns', () => {
    const state = initialState();
    const discoverEvent = {
      kind: 'TAG_CHANGE',
      entity: String(state.player.entityId),
      tag: 'DISCOVER',
      value: 'TB_GolBostrum',
    } as const;
    const result = applyDiscover(state, discoverEvent);
    expect(result.player.discoveredCardId).toBe('TB_GolBostrum');

    // Simulate a turn increment via MAIN_READY
    const turnEvent = {
      kind: 'TAG_CHANGE',
      entity: String(state.player.entityId),
      tag: 'STEP',
      value: 'MAIN_READY',
    } as const;
    const afterTurn = applyDiscover(result, turnEvent);
    expect(afterTurn.player.discoveredCardId).toBe('TB_GolBostrum');
  });
});
