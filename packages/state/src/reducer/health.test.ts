import { describe, expect, it } from 'bun:test';
import { initialState } from '../initialState';
import { applyHeroHealth } from './health';
import type { TagChange } from '@overlay/log-parser';

describe('applyHeroHealth', () => {
  it('updates player hp when entity matches', () => {
    const base = initialState();
    const state = {
      ...base,
      player: {
        ...base.player,
        hero: { ...base.player.hero, entityId: 3 },
      },
    };
    const event: TagChange = { kind: 'TAG_CHANGE', entity: '3', tag: 'HEALTH', value: '25' };
    const next = applyHeroHealth(state, event);
    expect(next.player.hero.hp).toBe(25);
  });

  it('ignores health change for non-player entity', () => {
    const state = initialState();
    const event: TagChange = { kind: 'TAG_CHANGE', entity: '99', tag: 'HEALTH', value: '10' };
    expect(applyHeroHealth(state, event)).toBe(state);
  });
});
