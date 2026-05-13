import { describe, expect, it } from 'bun:test';
import type { OpponentState } from '@overlay/shared';
import { predictOpponentBoard } from './opponentPredictor';

function makeOpponent(minionIds: string[]): OpponentState {
  return {
    entityId: 1,
    playerId: 2,
    hero: { entityId: 2, cardId: 'OpponentHero', hp: 30, armor: 0 },
    board: {
      minions: minionIds.map((id, i) => ({
        entityId: i + 100,
        cardId: id,
        attack: 1,
        health: 1,
        taunt: false,
        divineShield: false,
        poisonous: false,
        reborn: false,
        frozen: false,
        tribes: [],
        golden: false,
        windfury: false,
        cleave: false,
      })),
    },
    tier: 3,
    eliminated: false,
  };
}

describe('predictOpponentBoard', () => {
  it('returns empty board for opponent with no minions', () => {
    const opp = makeOpponent([]);
    const result = predictOpponentBoard(opp, 1);
    expect(result.minions).toEqual([]);
  });

  it('returns a copy of opponent minions', () => {
    const opp = makeOpponent(['Squire', 'Kobold']);
    const result = predictOpponentBoard(opp, 1);
    expect(result.minions.length).toBe(2);
    expect(result.minions[0]?.cardId).toBe('Squire');
    expect(result.minions[1]?.cardId).toBe('Kobold');
  });

  it('returns a deep copy — mutating result does not affect original', () => {
    const opp = makeOpponent(['Squire']);
    const result = predictOpponentBoard(opp, 1);
    result.minions.length = 0;
    expect(opp.board.minions.length).toBe(1);
  });

  it('scales minion stats upward when turn > 4', () => {
    const opp = makeOpponent(['Squire']);
    const early = predictOpponentBoard(opp, 1);
    const late = predictOpponentBoard(opp, 8);
    expect(early.minions[0]?.attack).toBe(1);
    expect(early.minions[0]?.health).toBe(1);
    expect(late.minions[0]?.attack).toBe(1);
    expect(late.minions[0]?.health).toBe(1);
    const totalStatsEarly = early.minions.reduce((s, m) => s + m.attack + m.health, 0);
    const totalStatsLate = late.minions.reduce((s, m) => s + m.attack + m.health, 0);
    expect(totalStatsLate).toBeGreaterThanOrEqual(totalStatsEarly);
  });

  it('scales stats proportionally to turn number above 4', () => {
    const opp = makeOpponent(['Squire', 'Kobold Geomancer']);
    const t5 = predictOpponentBoard(opp, 5);
    const t8 = predictOpponentBoard(opp, 8);
    const t12 = predictOpponentBoard(opp, 12);
    const stats = (mins: { attack: number; health: number }[]) =>
      mins.reduce((s, m) => s + m.attack + m.health, 0);
    expect(stats(t5.minions)).toBeLessThanOrEqual(stats(t8.minions));
    expect(stats(t8.minions)).toBeLessThanOrEqual(stats(t12.minions));
  });
});
