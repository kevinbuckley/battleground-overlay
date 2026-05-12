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
      })),
    },
    tier: 3,
    eliminated: false,
  };
}

describe('predictOpponentBoard', () => {
  it('returns empty board for opponent with no minions', () => {
    const opp = makeOpponent([]);
    const result = predictOpponentBoard(opp);
    expect(result.minions).toEqual([]);
  });

  it('returns a copy of opponent minions', () => {
    const opp = makeOpponent(['Squire', 'Kobold']);
    const result = predictOpponentBoard(opp);
    expect(result.minions.length).toBe(2);
    expect(result.minions[0].cardId).toBe('Squire');
    expect(result.minions[1].cardId).toBe('Kobold');
  });

  it('returns a deep copy — mutating result does not affect original', () => {
    const opp = makeOpponent(['Squire']);
    const result = predictOpponentBoard(opp);
    result.minions.length = 0;
    expect(opp.board.minions.length).toBe(1);
  });
});
