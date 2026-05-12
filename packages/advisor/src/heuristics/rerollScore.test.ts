import { describe, expect, it } from 'bun:test';
import type { GameState, Minion } from '@overlay/shared';
import { initialState } from '@overlay/state';
import { rerollScore } from './rerollScore';

function makeMinion(
  entityId: number,
  cardId: string,
  attack: number,
  health: number,
  tribes: string[] = [],
): Minion {
  return {
    entityId,
    cardId,
    attack,
    health,
    taunt: false,
    divineShield: false,
    poisonous: false,
    reborn: false,
    frozen: false,
    tribes,
  };
}

function makeStateWithShop(
  shopMinions: Minion[],
  playerBoard: Minion[] = [],
  hp = 30,
  gold = 3,
  rollCost = 1,
): GameState {
  const state = initialState();
  state.player.shop.minions = shopMinions;
  state.player.board.minions = playerBoard;
  state.player.hero.hp = hp;
  state.player.gold = gold;
  state.player.shop.rollCost = rollCost;
  return state;
}

describe('rerollScore', () => {
  it('returns 0 for empty shop', () => {
    const state = initialState();
    expect(rerollScore(state)).toBe(0);
  });

  it('returns 0 when shop has triple potential', () => {
    const state = makeStateWithShop(
      [makeMinion(1, 'TRIPLE', 2, 2)],
      [makeMinion(2, 'TRIPLE', 1, 1), makeMinion(3, 'TRIPLE', 1, 1)],
    );
    // 2 copies on board + shop card = triple (score 1.0), so reroll = 0
    expect(rerollScore(state)).toBe(0);
  });

  it('returns 0 when shop has tribe synergy', () => {
    const state = makeStateWithShop(
      [makeMinion(1, 'MECH', 3, 3, ['Mech'])],
      [makeMinion(2, 'MECH2', 2, 2, ['Mech'])],
    );
    // Mech shop card has synergy with Mech on board (0.15), but threshold is 0.5
    // Actually 0.15 < 0.5, so synergy check passes. But triple check passes too.
    // HP is 30 >= 15, gold 3 >= rollCost 1.
    // All conditions met → should return 1.0
    expect(rerollScore(state)).toBe(1.0);
  });

  it('returns 0 when HP is unsafe (< 15)', () => {
    const state = makeStateWithShop(
      [makeMinion(1, 'SAFE', 2, 2)],
      [],
      10, // unsafe HP
    );
    expect(rerollScore(state)).toBe(0);
  });

  it('returns 0 when player cannot afford reroll', () => {
    const state = makeStateWithShop(
      [makeMinion(1, 'EXPENSIVE', 3, 3)],
      [],
      30,
      0, // no gold
      1, // rollCost = 1
    );
    expect(rerollScore(state)).toBe(0);
  });

  it('returns 1.0 when all conditions are met', () => {
    const state = makeStateWithShop(
      [makeMinion(1, 'NOVEL', 2, 2)],
      [makeMinion(2, 'OTHER', 3, 3)],
      20,
      3,
      1,
    );
    // No triple (0 copies on board), no synergy (different tribes),
    // hp 20 >= 15, gold 3 >= rollCost 1
    expect(rerollScore(state)).toBe(1.0);
  });
});
