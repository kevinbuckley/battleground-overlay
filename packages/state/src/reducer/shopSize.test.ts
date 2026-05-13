import { describe, expect, it } from 'bun:test';
import type { HsEvent } from '@overlay/log-parser';
import { initialState } from '../initialState';
import { applyShopSize } from './shopSize';

function tagChange(entity: string, tag: string, value: string): HsEvent {
  return { kind: 'TAG_CHANGE', entity, tag, value };
}

describe('applyShopSize', () => {
  it('sets shopSize when NUM_MINIONS_IN_BOB_DECK changes on player', () => {
    const state = initialState();
    const event = tagChange('0', 'NUM_MINIONS_IN_BOB_DECK', '5');
    const result = applyShopSize(state, event);
    expect(result.player.shopSize).toBe(5);
  });

  it('ignores NUM_MINIONS_IN_BOB_DECK on non-player entity', () => {
    const state = {
      ...initialState(),
      player: { ...initialState().player, entityId: 1 },
    };
    const event = tagChange('0', 'NUM_MINIONS_IN_BOB_DECK', '5');
    const result = applyShopSize(state, event);
    expect(result.player.shopSize).toBe(3);
  });

  it('ignores non-NUM_MINIONS_IN_BOB_DECK tags', () => {
    const state = initialState();
    const event = tagChange('0', 'HEALTH', '35');
    const result = applyShopSize(state, event);
    expect(result.player.shopSize).toBe(3);
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
    const result = applyShopSize(state, event as HsEvent);
    expect(result.player.shopSize).toBe(3);
  });
});
