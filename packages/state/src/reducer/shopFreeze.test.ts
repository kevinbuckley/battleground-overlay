import { describe, expect, it } from 'bun:test';
import type { TagChange } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';
import { initialState } from '../initialState';
import { applyShopFreeze } from './shopFreeze';

function makeEvent(entityId: number, frozen: number): TagChange {
  return {
    kind: 'TAG_CHANGE',
    entity: String(entityId),
    tag: 'FROZEN',
    value: String(frozen),
  };
}

function makeState(frozen: boolean): GameState {
  return {
    ...initialState(),
    player: {
      ...initialState().player,
      entityId: 1,
      shop: {
        ...initialState().player.shop,
        frozen,
      },
    },
  };
}

describe('applyShopFreeze', () => {
  it('sets shop.frozen to true when FROZEN=1 on player controller', () => {
    const state = makeState(false);
    const result = applyShopFreeze(state, makeEvent(1, 1));
    expect(result.player.shop.frozen).toBe(true);
  });

  it('sets shop.frozen to false when FROZEN=0 on player controller', () => {
    const state = makeState(true);
    const result = applyShopFreeze(state, makeEvent(1, 0));
    expect(result.player.shop.frozen).toBe(false);
  });

  it('returns unchanged state for wrong entity ID', () => {
    const state = makeState(false);
    const result = applyShopFreeze(state, makeEvent(99, 1));
    expect(result).toBe(state);
  });
});
