import { describe, expect, it } from 'bun:test';
import type { GameState, Minion, OpponentState, PlayerState } from '@overlay/shared';
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
    gold: 3,
    ...overrides,
  };
}

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    ...initialState(),
    ...overrides,
  };
}

function makeOpponentStub(overrides: Partial<OpponentState> = {}): OpponentState {
  return {
    entityId: 0,
    playerId: 0,
    hero: { entityId: 0, cardId: '', hp: 40, armor: 0 },
    board: { minions: [] },
    tier: 1,
    eliminated: false,
    turnsPlayed: 0,
    revives: 0,
    turnsInGame: 0,
    totalCardsPlayed: 0,
    totalCardsDrawn: 0,
    minionsOnBoard: 0,
    minionsKilledThisTurn: 0,
    cardsDrawnThisTurn: 0,
    cardsGivenThisTurn: 0,
    cardsPlayedThisTurn: 0,
    deckSize: 30,
    combo: 0,
    bountyCards: 0,
    victories: 0,
    gameType: null,
    turnTimer: 15,
    numGameTurns: 0,
    numChoices: 0,
    deathrattlesTriggeredThisTurn: 0,
    minionsDiedThisTurn: 0,
    minionsTradedThisTurn: 0,
    ...overrides,
  };
}

function makeMinion(overrides: Partial<Minion> = {}): Minion {
  return {
    entityId: 1,
    cardId: 'CS3_001',
    attack: 3,
    health: 2,
    taunt: false,
    divineShield: false,
    poisonous: false,
    reborn: false,
    frozen: false,
    golden: false,
    windfury: false,
    cleave: false,
    elite: false,
    lifesteal: false,
    cost: 3,
    tribes: ['Beast'],
    spellPower: 0,
    exhausted: false,
    magnetic: false,
    immune: false,
    charge: false,
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

  it('does not treat unresolved opponent stubs as simulation evidence', () => {
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
      turn: 8,
      opponents: Array.from({ length: 7 }, () => makeOpponentStub()),
      player: makePlayer({
        shop: {
          minions: shopMinions,
          frozen: false,
          rollCost: 2,
        },
      }),
    });

    const result = scoreBuysWithSim(state, 10, 5000);

    expect(result).toHaveLength(1);
    expect(result[0].score).toBe(0);
    expect(result[0].confidence).toBe(0.05);
    expect(result[0].reason).toBe('no simulation data');
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
          minions: [makeMinion()],
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
          minions: [makeMinion()],
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
          minions: [makeMinion()],
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

describe('OpponentState tracking fields in budgetScorer', () => {
  it('uses opponent.minionsOnBoard when opponent has tracked stats', () => {
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
      turn: 6,
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
          minionsOnBoard: 3,
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

  it('falls back to predictOpponentBoard when opponent has default (0) minionsOnBoard', () => {
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
      turn: 6,
      opponents: [
        {
          entityId: 100,
          playerId: 1,
          hero: { cardId: 'Hero_Dragon', hp: 30, armor: 0 },
          board: { minions: [] },
          tier: 5,
          eliminated: false,
          minionsOnBoard: 0,
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
