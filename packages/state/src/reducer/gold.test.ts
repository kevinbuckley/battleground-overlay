import { describe, expect, it } from 'bun:test';
import { initialState } from '../initialState';
import { applyGold } from './gold';
import type { TagChange } from '@overlay/log-parser';

describe('applyGold', () => {
  it('updates player gold when controller entity matches', () => {
    const base = initialState();
    const state = { ...base, player: { ...base.player, entityId: 2 } };
    const event: TagChange = { kind: 'TAG_CHANGE', entity: '2', tag: 'RESOURCES', value: '7' };
    expect(applyGold(state, event).player.gold).toBe(7);
  });

  it('ignores gold for non-player entity', () => {
    const state = initialState();
    const event: TagChange = { kind: 'TAG_CHANGE', entity: '99', tag: 'RESOURCES', value: '5' };
    expect(applyGold(state, event)).toBe(state);
  });
});
