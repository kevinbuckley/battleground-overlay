import { describe, expect, it } from 'bun:test';
import { initialState } from './initialState';
import { reducer } from './reducer';
import type { BlockStart } from '@overlay/log-parser';

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
