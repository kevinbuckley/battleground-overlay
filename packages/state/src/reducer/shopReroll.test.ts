import { describe, expect, it } from 'bun:test';
import type { TagChange } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';
import { initialState } from '../initialState';
import { applyShopReroll } from './shopReroll';

function makeEvent(entityId: number, goldUsed: number): TagChange {
  return {
    kind: 'TAG_CHANGE',
    entity: String(entityId),
    tag: 'RESOURCES_USED',
    value: String(goldUsed),
  };
}

function makeState(gold: number, frozen: boolean): GameState {
  return {
    ...initialState(),
    player: {
      ...initialState().player,
      entityId: 1,
      gold,
      shop: {
        ...initialState().player.shop,
        frozen,
      },
    },
  };
}

describe('applyShopReroll', () => {
  it('decrements gold by the RESOURCES_USED value', () => {
    const state = makeState(5, false);
    const result = applyShopReroll(state, makeEvent(1, 2));
    expect(result.player.gold).toBe(3);
  });

  it('clears shop.frozen on reroll', () => {
    const state = makeState(5, true);
    const result = applyShopReroll(state, makeEvent(1, 2));
    expect(result.player.shop.frozen).toBe(false);
  });

  it('returns unchanged state for wrong entity ID', () => {
    const state = makeState(5, true);
    const result = applyShopReroll(state, makeEvent(99, 2));
    expect(result).toBe(state);
  });
});
