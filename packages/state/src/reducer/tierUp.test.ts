import { describe, expect, it } from 'bun:test';
import type { TagChange } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';
import { initialState } from '../initialState';
import { applyTierUp } from './tierUp';

function makeEvent(entityId: number, value: string): TagChange {
  return {
    kind: 'TAG_CHANGE',
    entity: String(entityId),
    tag: 'PLAYER_TECH_LEVEL',
    value,
  };
}

describe('applyTierUp', () => {
  it('updates tier and tierUpCost when tier increases 3→4', () => {
    const state: GameState = {
      ...initialState(),
      player: {
        ...initialState().player,
        entityId: 1,
        tier: 3,
        tierUpCost: 4,
      },
    };
    const result = applyTierUp(state, makeEvent(1, '4'));
    expect(result.player.tier).toBe(4);
    expect(result.player.tierUpCost).toBe(5);
  });

  it('updates tier and tierUpCost when tier increases 4→5', () => {
    const state: GameState = {
      ...initialState(),
      player: {
        ...initialState().player,
        entityId: 1,
        tier: 4,
        tierUpCost: 5,
      },
    };
    const result = applyTierUp(state, makeEvent(1, '5'));
    expect(result.player.tier).toBe(5);
    expect(result.player.tierUpCost).toBe(6);
  });

  it('returns unchanged state when tier does not increase', () => {
    const state: GameState = {
      ...initialState(),
      player: {
        ...initialState().player,
        entityId: 1,
        tier: 5,
        tierUpCost: 6,
      },
    };
    const result = applyTierUp(state, makeEvent(1, '3'));
    expect(result).toBe(state);
  });

  it('returns unchanged state when tier stays the same', () => {
    const state: GameState = {
      ...initialState(),
      player: {
        ...initialState().player,
        entityId: 1,
        tier: 4,
        tierUpCost: 5,
      },
    };
    const result = applyTierUp(state, makeEvent(1, '4'));
    expect(result).toBe(state);
  });

  it('returns unchanged state for wrong entity ID', () => {
    const state: GameState = {
      ...initialState(),
      player: {
        ...initialState().player,
        entityId: 1,
        tier: 3,
        tierUpCost: 4,
      },
    };
    const result = applyTierUp(state, makeEvent(99, '4'));
    expect(result).toBe(state);
  });

  it('returns unchanged state for invalid tier value', () => {
    const state: GameState = {
      ...initialState(),
      player: {
        ...initialState().player,
        entityId: 1,
        tier: 3,
        tierUpCost: 4,
      },
    };
    const result = applyTierUp(state, makeEvent(1, 'abc'));
    expect(result).toBe(state);
  });

  it('handles tier 1→2 upgrade', () => {
    const state: GameState = {
      ...initialState(),
      player: {
        ...initialState().player,
        entityId: 1,
        tier: 1,
        tierUpCost: 6,
      },
    };
    const result = applyTierUp(state, makeEvent(1, '2'));
    expect(result.player.tier).toBe(2);
    expect(result.player.tierUpCost).toBe(5);
  });

  it('handles tier 6→7 upgrade', () => {
    const state: GameState = {
      ...initialState(),
      player: {
        ...initialState().player,
        entityId: 1,
        tier: 6,
        tierUpCost: 6,
      },
    };
    const result = applyTierUp(state, makeEvent(1, '7'));
    expect(result.player.tier).toBe(7);
    expect(result.player.tierUpCost).toBe(6);
  });
});
