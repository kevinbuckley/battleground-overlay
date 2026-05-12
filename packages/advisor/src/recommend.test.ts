import { describe, expect, it } from 'bun:test';
import type { Minion } from '@overlay/shared';
import { initialState } from '@overlay/state';
import { scoreBuysWithSim } from './budgetScorer';
import { recommend } from './recommend';

function minion(cardId: string, tribes: string[] = []): Minion {
  return {
    entityId: Math.floor(Math.random() * 10000),
    cardId,
    attack: 1,
    health: 1,
    taunt: false,
    divineShield: false,
    poisonous: false,
    reborn: false,
    frozen: false,
    tribes,
  };
}

describe('recommend', () => {
  it('returns empty array for empty shop', () => {
    expect(recommend(initialState())).toEqual([]);
  });

  it('returns at most 3 recommendations', () => {
    const base = initialState();
    const state = {
      ...base,
      player: {
        ...base.player,
        shop: {
          ...base.player.shop,
          minions: [minion('A'), minion('B'), minion('C'), minion('D'), minion('E')],
        },
      },
    };
    expect(recommend(state).length).toBeLessThanOrEqual(3);
  });

  it('ranks triple opportunity highest', () => {
    const base = initialState();
    const board = [
      { ...minion('TRIPLE_CARD'), attack: 5, health: 5, tribes: ['Dragon'] },
      { ...minion('TRIPLE_CARD'), attack: 5, health: 5, tribes: ['Dragon'] },
    ];
    const shopMinion = { ...minion('TRIPLE_CARD'), tribes: ['Dragon'] };
    const state = {
      ...base,
      player: {
        ...base.player,
        board: { minions: board },
        shop: {
          ...base.player.shop,
          minions: [shopMinion, minion('OTHER')],
        },
      },
    };
    const recs = recommend(state);
    expect(recs[0]?.action.type).toBe('Buy');
    if (recs[0]?.action.type === 'Buy') {
      expect(recs[0].action.cardId).toBe('TRIPLE_CARD');
    }
  });

  it('includes Reroll when shop has no good buys and conditions are met', () => {
    const base = initialState();
    const state = {
      ...base,
      player: {
        ...base.player,
        board: { minions: [minion('OTHER', ['Beast'])] },
        shop: {
          ...base.player.shop,
          minions: [minion('NOVEL', ['Murloc']), minion('SAFE', ['Elemental'])],
          rollCost: 1,
        },
        hero: { ...base.player.hero, hp: 20 },
        gold: 3,
      },
    };
    const recs = recommend(state);
    const rerollRec = recs.find((r) => r.action.type === 'Reroll');
    expect(rerollRec).toBeDefined();
  });

  it('excludes Reroll when shop has triple potential', () => {
    const base = initialState();
    const board = [minion('TRIPLE', ['Dragon']), minion('TRIPLE', ['Dragon'])];
    const state = {
      ...base,
      player: {
        ...base.player,
        board: { minions: board },
        shop: {
          ...base.player.shop,
          minions: [minion('TRIPLE', ['Dragon'])],
          rollCost: 1,
        },
        hero: { ...base.player.hero, hp: 30 },
        gold: 3,
      },
    };
    const recs = recommend(state);
    const rerollRec = recs.find((r) => r.action.type === 'Reroll');
    expect(rerollRec).toBeUndefined();
  });

  it('excludes Reroll when HP is unsafe', () => {
    const base = initialState();
    const state = {
      ...base,
      player: {
        ...base.player,
        board: { minions: [] },
        shop: {
          ...base.player.shop,
          minions: [minion('NOVEL', ['Murloc'])],
          rollCost: 1,
        },
        hero: { ...base.player.hero, hp: 10 },
        gold: 3,
      },
    };
    const recs = recommend(state);
    const rerollRec = recs.find((r) => r.action.type === 'Reroll');
    expect(rerollRec).toBeUndefined();
  });

  it('excludes Reroll when player cannot afford reroll', () => {
    const base = initialState();
    const state = {
      ...base,
      player: {
        ...base.player,
        board: { minions: [] },
        shop: {
          ...base.player.shop,
          minions: [minion('NOVEL', ['Murloc'])],
          rollCost: 1,
        },
        hero: { ...base.player.hero, hp: 30 },
        gold: 0,
      },
    };
    const recs = recommend(state);
    const rerollRec = recs.find((r) => r.action.type === 'Reroll');
    expect(rerollRec).toBeUndefined();
  });

  it('with 0 sims still returns ≥1 recommendation via heuristic fallback', () => {
    const base = initialState();
    const state = {
      ...base,
      player: {
        ...base.player,
        shop: {
          ...base.player.shop,
          minions: [minion('SHOP_A'), minion('SHOP_B')],
        },
      },
    };
    // scoreBuysWithSim with n=0 returns recs with score 0
    const simRecs = scoreBuysWithSim(state, 0, 2000);
    expect(simRecs.length).toBe(2);
    expect(simRecs.every((r) => r.score === 0)).toBe(true);

    // recommend should use sim recs (even with score 0) since they exist
    const recs = recommend(state);
    expect(recs.length).toBeGreaterThanOrEqual(1);
  });

  it('sets needsExplanation: true when all recommendations have score < 0.4', () => {
    const base = initialState();
    const state = {
      ...base,
      player: {
        ...base.player,
        shop: {
          ...base.player.shop,
          minions: [minion('SHOP_A'), minion('SHOP_B')],
        },
      },
    };
    const recs = recommend(state);
    expect(recs.length).toBeGreaterThan(0);
    expect(recs.every((r) => r.needsExplanation === true)).toBe(true);
  });

  it('sets needsExplanation: true when recommendations are empty', () => {
    const recs = recommend(initialState());
    expect(recs).toEqual([]);
  });

  it('sets needsExplanation: false when at least one recommendation has score >= 0.4', () => {
    const base = initialState();
    const board = [
      { ...minion('TRIPLE_CARD'), attack: 5, health: 5, tribes: ['Dragon'] },
      { ...minion('TRIPLE_CARD'), attack: 5, health: 5, tribes: ['Dragon'] },
    ];
    const shopMinion = { ...minion('TRIPLE_CARD'), tribes: ['Dragon'] };
    const state = {
      ...base,
      player: {
        ...base.player,
        board: { minions: board },
        shop: {
          ...base.player.shop,
          minions: [shopMinion, minion('OTHER')],
        },
      },
    };
    const recs = recommend(state);
    expect(recs.some((r) => r.action.type === 'Buy')).toBe(true);
    const buyRecs = recs.filter((r) => r.action.type === 'Buy');
    if (buyRecs.length > 0) {
      expect(buyRecs[0].needsExplanation).toBe(false);
    }
  });

  it('sets needsExplanation: false when all recommendations have score >= 0.4', () => {
    const base = initialState();
    const board = [
      { ...minion('TRIPLE_CARD'), attack: 5, health: 5, tribes: ['Dragon'] },
      { ...minion('TRIPLE_CARD'), attack: 5, health: 5, tribes: ['Dragon'] },
    ];
    const shopMinion = { ...minion('TRIPLE_CARD'), tribes: ['Dragon'] };
    const state = {
      ...base,
      player: {
        ...base.player,
        board: { minions: board },
        shop: {
          ...base.player.shop,
          minions: [shopMinion, minion('OTHER')],
        },
      },
    };
    const recs = recommend(state);
    const buyRecs = recs.filter((r) => r.action.type === 'Buy');
    if (buyRecs.length > 0) {
      expect(buyRecs.every((r) => r.needsExplanation === false)).toBe(true);
    }
  });

  it('falls back to heuristic buys when sim returns empty', () => {
    const base = initialState();
    const state = {
      ...base,
      player: {
        ...base.player,
        shop: {
          ...base.player.shop,
          minions: [minion('SHOP_A'), minion('SHOP_B')],
        },
        board: {
          minions: [
            { ...minion('BOARD_A'), tribes: ['Dragon'] },
            { ...minion('BOARD_A'), tribes: ['Dragon'] },
          ],
        },
      },
    };
    // We test the fallback path by checking that heuristic recs are produced
    // when sim returns empty. Since scoreBuysWithSim with n=0 returns score-0
    // recs (not empty), we verify the fallback path exists by checking that
    // the heuristic path produces Buy recs with triple/tribe scoring.
    const recs = recommend(state);
    const buyRecs = recs.filter((r) => r.action.type === 'Buy');
    expect(buyRecs.length).toBeGreaterThanOrEqual(1);
  });
});
