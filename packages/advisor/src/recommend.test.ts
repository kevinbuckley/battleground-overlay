import { describe, expect, it } from 'bun:test';
import type { Minion } from '@overlay/shared';
import { initialState } from '@overlay/state';
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
});
