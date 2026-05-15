import { describe, expect, it } from 'bun:test';
import { initialOpponentState } from './initialState';

describe('initialOpponentState', () => {
  it('returns correct entityId and playerId', () => {
    const state = initialOpponentState(42, 7);
    expect(state.entityId).toBe(42);
    expect(state.playerId).toBe(7);
  });

  it('defaults entityId and playerId to 0', () => {
    const state = initialOpponentState();
    expect(state.entityId).toBe(0);
    expect(state.playerId).toBe(0);
  });

  it('has correct base fields', () => {
    const state = initialOpponentState();
    expect(state.tier).toBe(1);
    expect(state.eliminated).toBe(false);
    expect(state.turnsPlayed).toBe(0);
    expect(state.revives).toBe(0);
    expect(state.hero.hp).toBe(40);
    expect(state.board.minions).toHaveLength(0);
  });

  it('turnsInGame starts at 0', () => {
    expect(initialOpponentState().turnsInGame).toBe(0);
  });

  it('totalCardsPlayed starts at 0', () => {
    expect(initialOpponentState().totalCardsPlayed).toBe(0);
  });

  it('totalCardsDrawn starts at 0', () => {
    expect(initialOpponentState().totalCardsDrawn).toBe(0);
  });

  it('minionsOnBoard starts at 0', () => {
    expect(initialOpponentState().minionsOnBoard).toBe(0);
  });

  it('minionsKilledThisTurn starts at 0', () => {
    expect(initialOpponentState().minionsKilledThisTurn).toBe(0);
  });

  it('cardsDrawnThisTurn starts at 0', () => {
    expect(initialOpponentState().cardsDrawnThisTurn).toBe(0);
  });

  it('cardsGivenThisTurn starts at 0', () => {
    expect(initialOpponentState().cardsGivenThisTurn).toBe(0);
  });

  it('cardsPlayedThisTurn starts at 0', () => {
    expect(initialOpponentState().cardsPlayedThisTurn).toBe(0);
  });

  it('deckSize starts at 30', () => {
    expect(initialOpponentState().deckSize).toBe(30);
  });

  it('combo starts at 0', () => {
    expect(initialOpponentState().combo).toBe(0);
  });

  it('bountyCards starts at 0', () => {
    expect(initialOpponentState().bountyCards).toBe(0);
  });

  it('victories starts at 0', () => {
    expect(initialOpponentState().victories).toBe(0);
  });

  it('gameType starts as null', () => {
    expect(initialOpponentState().gameType).toBeNull();
  });

  it('turnTimer starts at 15', () => {
    expect(initialOpponentState().turnTimer).toBe(15);
  });

  it('numGameTurns starts at 0', () => {
    expect(initialOpponentState().numGameTurns).toBe(0);
  });

  it('numChoices starts at 0', () => {
    expect(initialOpponentState().numChoices).toBe(0);
  });

  it('deathrattlesTriggeredThisTurn starts at 0', () => {
    expect(initialOpponentState().deathrattlesTriggeredThisTurn).toBe(0);
  });

  it('minionsDiedThisTurn starts at 0', () => {
    expect(initialOpponentState().minionsDiedThisTurn).toBe(0);
  });

  it('minionsTradedThisTurn starts at 0', () => {
    expect(initialOpponentState().minionsTradedThisTurn).toBe(0);
  });
});
