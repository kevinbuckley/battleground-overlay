import { describe, expect, it } from 'bun:test';
import type { TagChange } from '@overlay/log-parser';
import { initialState } from '../initialState';
import { applyArmor } from './armor';

describe('applyArmor', () => {
  it('updates player armor when entity matches hero', () => {
    const base = initialState();
    const state = {
      ...base,
      player: {
        ...base.player,
        hero: { ...base.player.hero, entityId: 3 },
      },
    };
    const event: TagChange = {
      kind: 'TAG_CHANGE',
      entity: '3',
      tag: 'ARMOR',
      value: '5',
    };
    const next = applyArmor(state, event);
    expect(next.player.hero.armor).toBe(5);
  });

  it('ignores armor change for non-player entity', () => {
    const state = initialState();
    const event: TagChange = {
      kind: 'TAG_CHANGE',
      entity: '99',
      tag: 'ARMOR',
      value: '10',
    };
    expect(applyArmor(state, event)).toBe(state);
  });

  it('ignores non-ARMOR tag changes', () => {
    const state = initialState();
    const event: TagChange = {
      kind: 'TAG_CHANGE',
      entity: '0',
      tag: 'HEALTH',
      value: '35',
    };
    expect(applyArmor(state, event)).toBe(state);
  });

  it('handles armor value of 0', () => {
    const state = {
      ...initialState(),
      player: {
        ...initialState().player,
        hero: { ...initialState().player.hero, entityId: 3, armor: 5 },
      },
    };
    const event: TagChange = {
      kind: 'TAG_CHANGE',
      entity: '3',
      tag: 'ARMOR',
      value: '0',
    };
    const next = applyArmor(state, event);
    expect(next.player.hero.armor).toBe(0);
  });
});
