import { describe, expect, it } from 'bun:test';
import type { TagChange } from '@overlay/log-parser';
import { initialState } from '../initialState';
import { applyOpponentTurnsPlayed } from './opponentTurnsPlayed';

function makeEvent(entity: string, value: string): TagChange {
  return { kind: 'TAG_CHANGE', entity, tag: 'NUM_TURNS_PLAYED', value };
}

function makeOpponent(
  entityId: number,
  playerId: number,
  tier: number,
): import('@overlay/shared').OpponentState {
  return {
    entityId,
    playerId,
    hero: { entityId, cardId: 'Hero_01', hp: 40, armor: 0 },
    board: { minions: [] },
    tier,
    eliminated: false,
    turnsPlayed: 0,
  };
}

describe('applyOppenturnsPlayed', () => {
  it('sets turnsPlayed on the matching opponent', () => {
    const state = {
      ...initialState(),
      opponents: [makeOpponent(1, 1, 3), makeOpponent(2, 2, 4), makeOpponent(3, 3, 5)],
    };
    const result = applyOpponentTurnsPlayed(state, makeEvent('2', '5'));
    expect(result.opponents.at(1)?.turnsPlayed).toBe(5);
    expect(result.opponents.at(0)?.turnsPlayed).toBe(0);
    expect(result.opponents.at(2)?.turnsPlayed).toBe(0);
  });

  it('initial value is 0 for new opponents', () => {
    const state = {
      ...initialState(),
      opponents: [makeOpponent(1, 1, 3)],
    };
    expect(state.opponents.at(0)?.turnsPlayed).toBe(0);
  });

  it('increments per turn', () => {
    const state = {
      ...initialState(),
      opponents: [makeOpponent(1, 1, 3)],
    };
    const r1 = applyOpponentTurnsPlayed(state, makeEvent('1', '1'));
    const r2 = applyOpponentTurnsPlayed(r1, makeEvent('1', '2'));
    const r3 = applyOpponentTurnsPlayed(r2, makeEvent('1', '3'));
    expect(r3.opponents.at(0)?.turnsPlayed).toBe(3);
  });

  it('no-op when entity is not an opponent', () => {
    const state = {
      ...initialState(),
      opponents: [makeOpponent(1, 1, 3)],
    };
    const result = applyOpponentTurnsPlayed(state, makeEvent('999', '5'));
    expect(result).toBe(state);
  });
});
