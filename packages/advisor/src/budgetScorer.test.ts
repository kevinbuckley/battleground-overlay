import { describe, expect, it } from 'bun:test';
import type { GameState, PlayerState } from '@overlay/shared';
import { initialState } from '@overlay/state';
import { scoreBuysWithSim } from './budgetScorer';

function makePlayer(overrides: Partial<PlayerState> = {}): PlayerState {
  return {
    ...initialState().player,
    ...overrides,
  };
}

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    ...initialState(),
    ...overrides,
  };
}

describe('scoreBuysWithSim', () => {
  it('returns recommendations with score 0 when n=0', () => {
    const shopMinions = [
      {
        entityId: 1,
        cardId: 'CS3_001',
        attack: 3,
        health: 2,
        taunt: false,
        divineShield: false,
        poisonous: false,
        reborn: false,
        frozen: false,
        tribes: ['Beast'],
      },
    ];

    const state = makeState({
      turn: 4,
      player: makePlayer({
        shop: {
          minions: shopMinions,
          frozen: false,
          rollCost: 2,
        },
      }),
    });

    const result = scoreBuysWithSim(state, 0, 1000);

    expect(result.length).toBeGreaterThan(0);
    for (const rec of result) {
      expect(rec.score).toBe(0);
    }
  });

  it('returns at most TOP_N results', () => {
    const shopMinions = [];
    for (let i = 0; i < 10; i++) {
      shopMinions.push({
        entityId: i,
        cardId: `CS3_${String(i).padStart(3, '0')}`,
        attack: i,
        health: i,
        taunt: false,
        divineShield: false,
        poisonous: false,
        reborn: false,
        frozen: false,
        tribes: [],
      });
    }

    const state = makeState({
      turn: 4,
      player: makePlayer({
        shop: {
          minions: shopMinions,
          frozen: false,
          rollCost: 2,
        },
      }),
    });

    const result = scoreBuysWithSim(state, 0, 1000);
    expect(result.length).toBeLessThanOrEqual(3);
  });

  it('returns recommendations with valid action types', () => {
    const shopMinions = [
      {
        entityId: 1,
        cardId: 'CS3_001',
        attack: 3,
        health: 2,
        taunt: false,
        divineShield: false,
        poisonous: false,
        reborn: false,
        frozen: false,
        tribes: ['Beast'],
      },
    ];

    const state = makeState({
      turn: 4,
      player: makePlayer({
        shop: {
          minions: shopMinions,
          frozen: false,
          rollCost: 2,
        },
      }),
    });

    const result = scoreBuysWithSim(state, 0, 1000);
    expect(result.length).toBe(1);
    const first = result[0];
    expect(first.action.type).toBe('Buy');
    const action = first.action as { type: 'Buy'; cardId: string; shopIndex: number };
    expect(action.cardId).toBe('CS3_001');
    expect(action.shopIndex).toBe(0);
  });

  it('returns recommendations with reason field populated', () => {
    const shopMinions = [
      {
        entityId: 1,
        cardId: 'CS3_001',
        attack: 3,
        health: 2,
        taunt: false,
        divineShield: false,
        poisonous: false,
        reborn: false,
        frozen: false,
        tribes: ['Beast'],
      },
    ];

    const state = makeState({
      turn: 4,
      player: makePlayer({
        shop: {
          minions: shopMinions,
          frozen: false,
          rollCost: 2,
        },
      }),
    });

    const result = scoreBuysWithSim(state, 0, 1000);
    const last = result[0];
    expect(last.reason).toBeTruthy();
    expect(typeof last.reason).toBe('string');
  });
});
