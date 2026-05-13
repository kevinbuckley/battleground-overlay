import { describe, expect, it } from 'bun:test';
import type { GameState } from '@overlay/shared';
import {
  enumerateBuyCandidates,
  enumerateFreezeCandidates,
  enumerateRerollCandidates,
  enumerateSellCandidates,
  enumerateTierUpCandidates,
} from './candidates';

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

  it('returns one candidate per board minion', () => {
    const boardMinions: GameState['player']['board']['minions'] = [
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
    ];
    const state = makeState([], boardMinions);
    const candidates = enumerateSellCandidates(state);
    expect(candidates).toHaveLength(2);
  });

  it('each candidate has correct action with boardIndex', () => {
    const boardMinions: GameState['player']['board']['minions'] = [
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
    const state = makeState([], boardMinions);
    const candidates = enumerateSellCandidates(state);
    expect((candidates[0].action as { type: string; boardIndex: number }).type).toBe('Sell');
    expect((candidates[0].action as { boardIndex: number }).boardIndex).toBe(0);
    expect((candidates[1].action as { boardIndex: number }).boardIndex).toBe(1);
  });

  it('projectedBoard contains all minions except the one being sold', () => {
    const boardMinions: GameState['player']['board']['minions'] = [
      {
        entityId: 50,
        cardId: 'Minion_A',
        attack: 2,
        health: 2,
        taunt: false,
        divineShield: false,
        poisonous: false,
        reborn: false,
        frozen: false,
        tribes: ['Beast'],
      },
      {
        entityId: 51,
        cardId: 'Minion_B',
        attack: 3,
        health: 3,
        taunt: false,
        divineShield: false,
        poisonous: false,
        reborn: false,
        frozen: false,
        tribes: ['Murloc'],
      },
      {
        entityId: 52,
        cardId: 'Minion_C',
        attack: 4,
        health: 4,
        taunt: false,
        divineShield: false,
        poisonous: false,
        reborn: false,
        frozen: false,
        tribes: ['Dragon'],
      },
    ];
    const state = makeState([], boardMinions);
    const candidates = enumerateSellCandidates(state);
    expect(candidates).toHaveLength(3);
    // Selling index 0: projected should have entities 51, 52
    const proj0 = candidates[0].projectedBoard.minions;
    expect(proj0).toHaveLength(2);
    expect(proj0[0].entityId).toBe(51);
    expect(proj0[1].entityId).toBe(52);
    // Selling index 1: projected should have entities 50, 52
    const proj1 = candidates[1].projectedBoard.minions;
    expect(proj1).toHaveLength(2);
    expect(proj1[0].entityId).toBe(50);
    expect(proj1[1].entityId).toBe(52);
    // Selling index 2: projected should have entities 50, 51
    const proj2 = candidates[2].projectedBoard.minions;
    expect(proj2).toHaveLength(2);
    expect(proj2[0].entityId).toBe(50);
    expect(proj2[1].entityId).toBe(51);
  });

  it('returns empty array when board is empty', () => {
    const state = makeState([], []);
    const candidates = enumerateSellCandidates(state);
    expect(candidates).toHaveLength(0);
  });
});

describe('enumerateFreezeCandidates', () => {
  it('returns 1 candidate when shop is not frozen', () => {
    const state = makeState([], []);
    const candidates = enumerateFreezeCandidates(state);
    expect(candidates).toHaveLength(1);
    expect(candidates[0].action).toEqual({ type: 'Freeze' });
  });

  it('returns empty array when shop is already frozen', () => {
    const state = makeState([], []);
    state.player.shop.frozen = true;
    const candidates = enumerateFreezeCandidates(state);
    expect(candidates).toHaveLength(0);
  });

  it('projectedBoard is the current board', () => {
    const boardMinions: GameState['player']['board']['minions'] = [
      {
        entityId: 100,
        cardId: 'Minion_1',
        attack: 2,
        health: 2,
        taunt: false,
        divineShield: false,
        poisonous: false,
        reborn: false,
        frozen: false,
        tribes: ['Beast'],
        golden: false,
        windfury: false,
        cleave: false,
      },
    ];
    const state = makeState([], boardMinions);
    const candidates = enumerateFreezeCandidates(state);
    expect(candidates[0].projectedBoard.minions).toHaveLength(1);
  });
});

describe('enumerateRerollCandidates', () => {
  it('returns 1 candidate when player can afford reroll', () => {
    const state = makeState([], []);
    const candidates = enumerateRerollCandidates(state);
    expect(candidates).toHaveLength(1);
    expect(candidates[0].action).toEqual({ type: 'Reroll' });
  });

  it('returns empty array when player cannot afford reroll', () => {
    const state = makeState([], []);
    state.player.gold = 1;
    state.player.shop.rollCost = 2;
    const candidates = enumerateRerollCandidates(state);
    expect(candidates).toHaveLength(0);
  });

  it('projectedBoard is the current board', () => {
    const boardMinions: GameState['player']['board']['minions'] = [
      {
        entityId: 100,
        cardId: 'Minion_1',
        attack: 2,
        health: 2,
        taunt: false,
        divineShield: false,
        poisonous: false,
        reborn: false,
        frozen: false,
        tribes: ['Beast'],
        golden: false,
        windfury: false,
        cleave: false,
      },
    ];
    const state = makeState([], boardMinions);
    const candidates = enumerateRerollCandidates(state);
    expect(candidates[0].projectedBoard.minions).toHaveLength(1);
  });
});

describe('enumerateTierUpCandidates', () => {
  it('returns 1 candidate when tier-3 player can afford tier-up', () => {
    const state = makeState([], []);
    state.player.tier = 3;
    state.player.tierUpCost = 4;
    state.player.gold = 4;
    const candidates = enumerateTierUpCandidates(state);
    expect(candidates).toHaveLength(1);
    expect(candidates[0].action).toEqual({ type: 'TierUp' });
  });

  it('returns empty array when player is tier 6', () => {
    const state = makeState([], []);
    state.player.tier = 6;
    state.player.gold = 10;
    const candidates = enumerateTierUpCandidates(state);
    expect(candidates).toHaveLength(0);
  });

  it('returns empty array when player cannot afford tier-up', () => {
    const state = makeState([], []);
    state.player.tier = 3;
    state.player.tierUpCost = 4;
    state.player.gold = 3;
    const candidates = enumerateTierUpCandidates(state);
    expect(candidates).toHaveLength(0);
  });
});
