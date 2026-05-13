import { describe, expect, it } from 'bun:test';
import type { TagChange } from '@overlay/log-parser';
import { initialState } from '../initialState';
import { applyFatigue } from './fatigue';

function makeFatigueEvent(value: string): TagChange {
  return { kind: 'TAG_CHANGE', entity: '0', tag: 'FATIGUE', value };
}

describe('applyFatigue', () => {
  it('reduces player hero HP by fatigue cost', () => {
    const state = initialState();
    const event = makeFatigueEvent('3');
    const result = applyFatigue(state, event);
    expect(result.player.hero.hp).toBe(37);
  });

  it('reduces player hero HP by fatigue cost (FATIGUE_COST tag)', () => {
    const state = initialState();
    const event: TagChange = {
      kind: 'TAG_CHANGE',
      entity: '0',
      tag: 'FATIGUE_COST',
      value: '5',
    };
    const result = applyFatigue(state, event);
    expect(result.player.hero.hp).toBe(35);
  });

  it('is no-op on an opponent entity', () => {
    const state = initialState();
    const event = makeFatigueEvent('3');
    const modifiedState = { ...state, player: { ...state.player, entityId: 999 } };
    const result = applyFatigue(modifiedState, event);
    expect(result).toBe(modifiedState);
  });

  it('is no-op when not a fatigue tag', () => {
    const state = initialState();
    const event: TagChange = {
      kind: 'TAG_CHANGE',
      entity: '0',
      tag: 'HEALTH',
      value: '3',
    };
    const result = applyFatigue(state, event);
    expect(result).toBe(state);
  });

  it('is no-op on a non-player entity', () => {
    const state = initialState();
    const event = makeFatigueEvent('3');
    const result = applyFatigue(state, { ...event, entity: '500' });
    expect(result).toBe(state);
  });
});
