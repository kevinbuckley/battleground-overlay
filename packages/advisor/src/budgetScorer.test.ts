import { describe, expect, it } from 'bun:test';
import type { GameState, PlayerState } from '@overlay/shared';
import { initialState } from '@overlay/state';
import {
  scoreBuysWithSim,
  scoreFreezeWithSim,
  scoreRerollWithSim,
  scoreTierUpWithSim,
} from './budgetScorer';

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

  it('projects empty opponent board via predictOpponentBoard', () => {
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
      turn: 5,
      opponents: [
        {
          entityId: 100,
          playerId: 1,
          hero: { cardId: 'Hero_Dragon', hp: 30, armor: 0 },
          board: { minions: [] },
          tier: 5,
          eliminated: false,
        },
      ],
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

  it('n=1 smoke test: real sim path executes without error', () => {
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

    const result = scoreBuysWithSim(state, 1, 5000);

    expect(result.length).toBeGreaterThan(0);
    const first = result[0];
    expect(first.score).toBeGreaterThanOrEqual(0);
    expect(first.action.type).toBe('Buy');
  });

  it('projects non-empty opponent board via predictOpponentBoard', () => {
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
      turn: 5,
      opponents: [
        {
          entityId: 100,
          playerId: 1,
          hero: { cardId: 'Hero_Dragon', hp: 30, armor: 0 },
          board: {
            minions: [
              {
                entityId: 200,
                cardId: 'TB_BaconBosss25_8',
                attack: 4,
                health: 4,
                taunt: true,
                divineShield: false,
                poisonous: false,
                reborn: false,
                frozen: false,
                tribes: ['Murloc'],
              },
            ],
          },
          tier: 5,
          eliminated: false,
        },
      ],
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
});

describe('scoreTierUpWithSim', () => {
  it('returns a recommendation when tier-3 and affordable', () => {
    const state = makeState({
      turn: 4,
      player: makePlayer({
        tier: 3,
        gold: 5,
        tierUpCost: 4,
      }),
    });

    const result = scoreTierUpWithSim(state, 0, 1000);

    expect(result.length).toBe(1);
    expect(result[0].action.type).toBe('TierUp');
    expect(result[0].score).toBe(0);
  });

  it('returns empty array when tier is 6 (max)', () => {
    const state = makeState({
      turn: 6,
      player: makePlayer({
        tier: 6,
        gold: 10,
        tierUpCost: 6,
      }),
    });

    const result = scoreTierUpWithSim(state, 0, 1000);

    expect(result).toEqual([]);
  });

  it('returns empty array when tier-up is too expensive', () => {
    const state = makeState({
      turn: 4,
      player: makePlayer({
        tier: 3,
        gold: 2,
        tierUpCost: 4,
      }),
    });

    const result = scoreTierUpWithSim(state, 0, 1000);

    expect(result).toEqual([]);
  });
});

describe('scoreFreezeWithSim', () => {
  it('returns a recommendation when shop is not frozen', () => {
    const state = makeState({
      turn: 4,
      player: makePlayer({
        shop: {
          minions: [],
          frozen: false,
          rollCost: 2,
        },
      }),
    });

    const result = scoreFreezeWithSim(state, 0, 1000);

    expect(result.length).toBe(1);
    expect(result[0].action.type).toBe('Freeze');
    expect(result[0].score).toBe(0);
  });

  it('returns empty array when shop is already frozen', () => {
    const state = makeState({
      turn: 4,
      player: makePlayer({
        shop: {
          minions: [],
          frozen: true,
          rollCost: 2,
        },
      }),
    });

    const result = scoreFreezeWithSim(state, 0, 1000);

    expect(result).toEqual([]);
  });

  it('returns a recommendation with score reflecting current board strength', () => {
    const state = makeState({
      turn: 4,
      player: makePlayer({
        shop: {
          minions: [],
          frozen: false,
          rollCost: 2,
        },
      }),
    });

    const result = scoreFreezeWithSim(state, 0, 1000);

    expect(result.length).toBe(1);
    expect(result[0].score).toBeGreaterThanOrEqual(0);
    expect(result[0].score).toBeLessThanOrEqual(1);
    expect(result[0].reason).toBeTruthy();
  });
});

describe('scoreRerollWithSim', () => {
  it('returns a recommendation when player can afford to reroll', () => {
    const state = makeState({
      turn: 4,
      player: makePlayer({
        gold: 3,
        shop: {
          minions: [],
          frozen: false,
          rollCost: 2,
        },
      }),
    });

    const result = scoreRerollWithSim(state, 0, 1000);

    expect(result.length).toBe(1);
    expect(result[0].action.type).toBe('Reroll');
    expect(result[0].score).toBe(0);
  });

  it('returns empty array when player cannot afford to reroll', () => {
    const state = makeState({
      turn: 4,
      player: makePlayer({
        gold: 1,
        shop: {
          minions: [],
          frozen: false,
          rollCost: 2,
        },
      }),
    });

    const result = scoreRerollWithSim(state, 0, 1000);

    expect(result).toEqual([]);
  });

  it('returns a recommendation with score reflecting current board strength', () => {
    const state = makeState({
      turn: 4,
      player: makePlayer({
        gold: 3,
        shop: {
          minions: [],
          frozen: false,
          rollCost: 2,
        },
      }),
    });

    const result = scoreRerollWithSim(state, 0, 1000);

    expect(result.length).toBe(1);
    expect(result[0].score).toBeGreaterThanOrEqual(0);
    expect(result[0].score).toBeLessThanOrEqual(1);
    expect(result[0].reason).toBeTruthy();
  });
});
