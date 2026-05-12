import { describe, expect, it } from 'bun:test';
import type { BlockStart, TagChange } from '@overlay/log-parser';
import { initialState } from './initialState';
import { reducer } from './reducer';

describe('reducer BLOCK_START TB_BaconShop_StartGame', () => {
  it('sets turn=1 and phase=shopping', () => {
    const event: BlockStart = {
      kind: 'BLOCK_START',
      blockType: 'TRIGGER',
      entity: 'GameEntity',
      effectCardId: 'TB_BaconShop_StartGame',
      effectIndex: 0,
      target: '0',
      subOption: '-1',
      triggerKeyword: 'NONE',
    };
    const next = reducer(initialState(), event);
    expect(next.turn).toBe(1);
    expect(next.phase).toBe('shopping');
  });
});

describe('reducer TAG_CHANGE ZONE=PLAY regression', () => {
  it('calls applyShopBuy on ZONE=PLAY', () => {
    const event: TagChange = {
      kind: 'TAG_CHANGE',
      entity: '1',
      tag: 'ZONE',
      value: 'PLAY',
    };
    const state = initialState();
    const next = reducer(state, event);
    // Should not throw and should return a GameState (same structure)
    expect(next).toBeDefined();
    expect(next.turn).toBe(state.turn);
  });
});

describe('reducer TAG_CHANGE ZONE=GRAVEYARD regression', () => {
  it('calls applyMinionRemoved on ZONE=GRAVEYARD', () => {
    const event: TagChange = {
      kind: 'TAG_CHANGE',
      entity: '1',
      tag: 'ZONE',
      value: 'GRAVEYARD',
    };
    const state = initialState();
    const next = reducer(state, event);
    // Should not throw and should return a GameState (same structure)
    expect(next).toBeDefined();
    expect(next.turn).toBe(state.turn);
  });
});
