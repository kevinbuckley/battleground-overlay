import { describe, expect, it } from 'bun:test';
import type { GameState } from '@overlay/shared';
import { enumerateBuyCandidates } from './candidates';

function makeState(
  shopMinions: GameState['player']['shop']['minions'],
  boardMinions: GameState['player']['board']['minions'],
): GameState {
  return {
    turn: 3,
    phase: 'shopping',
    player: {
      entityId: 1,
      playerId: 1,
      hero: { entityId: 1, cardId: 'Hero_Gurubashi', hp: 30, armor: 0 },
      board: { minions: boardMinions },
      shop: { minions: shopMinions, frozen: false, rollCost: 2 },
      gold: 5,
      tier: 3,
      tierUpCost: 4,
      eliminated: false,
      entityRegistry: new Map(),
    },
    opponents: [],
  };
}

describe('enumerateBuyCandidates', () => {
  it('returns one candidate per shop minion', () => {
    const shopMinions: GameState['player']['shop']['minions'] = [
      {
        entityId: 100,
        cardId: 'Minion_1',
        attack: 1,
        health: 2,
        taunt: false,
        divineShield: false,
        poisonous: false,
        reborn: false,
        frozen: false,
        tribes: ['Beast'],
      },
      {
        entityId: 101,
        cardId: 'Minion_2',
        attack: 3,
        health: 3,
        taunt: true,
        divineShield: false,
        poisonous: false,
        reborn: false,
        frozen: false,
        tribes: ['Murloc'],
      },
      {
        entityId: 102,
        cardId: 'Minion_3',
        attack: 2,
        health: 4,
        taunt: false,
        divineShield: true,
        poisonous: false,
        reborn: false,
        frozen: false,
        tribes: ['Beast'],
      },
    ];
    const state = makeState(shopMinions, []);
    const candidates = enumerateBuyCandidates(state);
    expect(candidates).toHaveLength(3);
  });

  it('each candidate has correct action with shopIndex', () => {
    const shopMinions: GameState['player']['shop']['minions'] = [
      {
        entityId: 200,
        cardId: 'Minion_A',
        attack: 1,
        health: 1,
        taunt: false,
        divineShield: false,
        poisonous: false,
        reborn: false,
        frozen: false,
        tribes: [],
      },
      {
        entityId: 201,
        cardId: 'Minion_B',
        attack: 2,
        health: 3,
        taunt: false,
        divineShield: false,
        poisonous: false,
        reborn: false,
        frozen: false,
        tribes: [],
      },
    ];
    const state = makeState(shopMinions, []);
    const candidates = enumerateBuyCandidates(state);
    expect(candidates[0].action).toEqual({ type: 'Buy', cardId: 'Minion_A', shopIndex: 0 });
    expect(candidates[1].action).toEqual({ type: 'Buy', cardId: 'Minion_B', shopIndex: 1 });
  });

  it('projectedBoard contains current board minions + the shop minion', () => {
    const boardMinions: GameState['player']['board']['minions'] = [
      {
        entityId: 50,
        cardId: 'ExistingMinion',
        attack: 2,
        health: 2,
        taunt: false,
        divineShield: false,
        poisonous: false,
        reborn: false,
        frozen: false,
        tribes: ['Beast'],
      },
    ];
    const shopMinions: GameState['player']['shop']['minions'] = [
      {
        entityId: 100,
        cardId: 'ShopBeast',
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
    const state = makeState(shopMinions, boardMinions);
    const candidates = enumerateBuyCandidates(state);
    expect(candidates[0].projectedBoard.minions).toHaveLength(2);
    const proj = candidates[0].projectedBoard.minions;
    expect(proj[0].entityId).toBe(50);
    expect(proj[1].entityId).toBe(100);
  });

  it('returns empty array when shop is empty', () => {
    const state = makeState([], []);
    const candidates = enumerateBuyCandidates(state);
    expect(candidates).toHaveLength(0);
  });
});
