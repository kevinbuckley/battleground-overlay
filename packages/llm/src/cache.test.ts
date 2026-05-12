import { describe, expect, it } from 'bun:test';
import type { GameState } from '@overlay/shared';
import { LlmCache, hashState } from './cache';

const baseState: GameState = {
  turn: 5,
  phase: 'shopping',
  player: {
    entityId: 1,
    playerId: 1,
    hero: { entityId: 1, cardId: 'Hero_Gurubashi', hp: 30, armor: 0 },
    board: { minions: [] },
    shop: { minions: [], frozen: false, rollCost: 3 },
    gold: 8,
    tier: 5,
    tierUpCost: 6,
    eliminated: false,
    entityRegistry: new Map(),
  },
  opponents: [],
};

describe('hashState', () => {
  it('produces a string hash from a GameState', () => {
    const hash = hashState(baseState);
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
  });

  it('produces the same hash for equivalent states', () => {
    const state1: GameState = { ...baseState };
    const state2: GameState = { ...baseState };
    expect(hashState(state1)).toBe(hashState(state2));
  });

  it('produces different hashes for different turns', () => {
    const state1: GameState = { ...baseState, turn: 3 };
    const state2: GameState = { ...baseState, turn: 5 };
    expect(hashState(state1)).not.toBe(hashState(state2));
  });

  it('produces different hashes for different player HP', () => {
    const state1: GameState = {
      ...baseState,
      player: { ...baseState.player, hero: { ...baseState.player.hero, hp: 20 } },
    };
    const state2: GameState = {
      ...baseState,
      player: { ...baseState.player, hero: { ...baseState.player.hero, hp: 30 } },
    };
    expect(hashState(state1)).not.toBe(hashState(state2));
  });

  it('produces different hashes for different tiers', () => {
    const state1: GameState = { ...baseState, player: { ...baseState.player, tier: 3 } };
    const state2: GameState = { ...baseState, player: { ...baseState.player, tier: 5 } };
    expect(hashState(state1)).not.toBe(hashState(state2));
  });

  it('produces different hashes for different gold amounts', () => {
    const state1: GameState = { ...baseState, player: { ...baseState.player, gold: 3 } };
    const state2: GameState = { ...baseState, player: { ...baseState.player, gold: 8 } };
    expect(hashState(state1)).not.toBe(hashState(state2));
  });

  it('produces different hashes for different phases', () => {
    const state1: GameState = { ...baseState, phase: 'combat' };
    const state2: GameState = { ...baseState, phase: 'shopping' };
    expect(hashState(state1)).not.toBe(hashState(state2));
  });

  it('includes board minion info in the hash', () => {
    const state1: GameState = {
      ...baseState,
      player: {
        ...baseState.player,
        board: {
          minions: [
            {
              entityId: 10,
              cardId: 'Minion_123',
              attack: 3,
              health: 4,
              taunt: false,
              divineShield: false,
              poisonous: false,
              reborn: false,
              frozen: false,
              tribes: [],
            },
          ],
        },
      },
    };
    const state2: GameState = {
      ...baseState,
      player: {
        ...baseState.player,
        board: {
          minions: [
            {
              entityId: 11,
              cardId: 'Minion_456',
              attack: 2,
              health: 5,
              taunt: true,
              divineShield: false,
              poisonous: false,
              reborn: false,
              frozen: false,
              tribes: [],
            },
          ],
        },
      },
    };
    expect(hashState(state1)).not.toBe(hashState(state2));
  });

  it('produces different hashes for different opponents', () => {
    const state1: GameState = {
      ...baseState,
      opponents: [
        {
          entityId: 2,
          playerId: 2,
          hero: { entityId: 2, cardId: 'Hero_DarkIron', hp: 25, armor: 0 },
          board: { minions: [] },
          tier: 4,
          eliminated: false,
        },
      ],
    };
    const state2: GameState = {
      ...baseState,
      opponents: [
        {
          entityId: 2,
          playerId: 2,
          hero: { entityId: 2, cardId: 'Hero_DarkIron', hp: 30, armor: 0 },
          board: { minions: [] },
          tier: 4,
          eliminated: false,
        },
      ],
    };
    expect(hashState(state1)).not.toBe(hashState(state2));
  });
});

describe('LlmCache', () => {
  it('stores and retrieves a cached result', () => {
    const cache = new LlmCache();
    cache.set(baseState, 'cached-result');
    expect(cache.get(baseState)).toBe('cached-result');
  });

  it('returns undefined for uncached states', () => {
    const cache = new LlmCache();
    expect(cache.get(baseState)).toBeUndefined();
  });

  it('updates LRU order on get', () => {
    const cache = new LlmCache();
    // Fill to 50 entries (at capacity)
    for (let i = 1; i <= 50; i++) {
      const state: GameState = { ...baseState, turn: i };
      cache.set(state, `result-${i}`);
    }
    expect(cache.size).toBe(50);
    // Access turn 1 to make it most recently used
    cache.get({ ...baseState, turn: 1 });
    // Now add turn 51 — this triggers eviction of the oldest (turn 2)
    const state51: GameState = { ...baseState, turn: 51 };
    cache.set(state51, 'result-51');
    // turn 2 should be evicted (turn 1 was accessed, so it's not oldest)
    expect(cache.get({ ...baseState, turn: 2 })).toBeUndefined();
    // turn 1 and turn 51 should still exist
    expect(cache.get({ ...baseState, turn: 1 })).toBe('result-1');
    expect(cache.get(state51)).toBe('result-51');
  });

  it('evicts oldest entry when exceeding MAX_ENTRIES (50)', () => {
    const cache = new LlmCache();
    for (let i = 0; i < 51; i++) {
      const state: GameState = { ...baseState, turn: i };
      cache.set(state, `result-${i}`);
    }
    expect(cache.size).toBe(50);
    // First entry (turn 0) should be evicted
    expect(cache.get({ ...baseState, turn: 0 })).toBeUndefined();
    // Last entry (turn 50) should exist
    expect(cache.get({ ...baseState, turn: 50 })).toBe('result-50');
  });

  it('updates value when setting same state hash', () => {
    const cache = new LlmCache();
    cache.set(baseState, 'old-result');
    expect(cache.get(baseState)).toBe('old-result');
    cache.set(baseState, 'new-result');
    expect(cache.get(baseState)).toBe('new-result');
  });

  it('clears all entries', () => {
    const cache = new LlmCache();
    cache.set(baseState, 'result');
    expect(cache.size).toBe(1);
    cache.clear();
    expect(cache.size).toBe(0);
    expect(cache.get(baseState)).toBeUndefined();
  });
});
