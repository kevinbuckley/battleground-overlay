import { describe, expect, it } from 'bun:test';
import { initialState } from '../initialState';
import { applyTier } from './tier';
import type { TagChange } from '@overlay/log-parser';

describe('applyTier', () => {
  it('updates player tier when controller entity matches', () => {
    const base = initialState();
    const state = { ...base, player: { ...base.player, entityId: 2 } };
    const event: TagChange = {
      kind: 'TAG_CHANGE',
      entity: '2',
      tag: 'PLAYER_TECH_LEVEL',
      value: '3',
    };
    expect(applyTier(state, event).player.tier).toBe(3);
  });

  it('ignores tier change for non-player entity', () => {
    const state = initialState();
    const event: TagChange = {
      kind: 'TAG_CHANGE',
      entity: '99',
      tag: 'PLAYER_TECH_LEVEL',
      value: '2',
    };
    expect(applyTier(state, event)).toBe(state);
  });
});
