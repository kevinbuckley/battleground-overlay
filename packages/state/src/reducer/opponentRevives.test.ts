import { describe, expect, it } from 'bun:test';
import type { TagChange } from '@overlay/log-parser';
import { initialState } from '../initialState';
import { applyOpponentRevives } from './opponentRevives';

function makeEvent(entity: string, value: string): TagChange {
  return { kind: 'TAG_CHANGE', entity, tag: 'NUM_REVIVES', value };
}

describe('applyOpponentRevives', () => {
  it('initial=0 when no revives event', () => {
    const state = initialState();
    const result = applyOpponentRevives(state, makeEvent('0', '0'));
    expect(result).toBe(state);
  });

  it('increments on opponent revive', () => {
    const state = initialState();
    const withOpp = {
      ...state,
      opponents: [
        {
          entityId: 100,
          playerId: 1,
          hero: { entityId: 100, cardId: 'Hero_BOT_01', hp: 40, armor: 0 },
          board: { minions: [] },
          tier: 3,
          eliminated: false,
          turnsPlayed: 0,
          revives: 0,
        },
      ],
    };
    const result = applyOpponentRevives(withOpp, makeEvent('100', '2'));
    expect(result.opponents[0].revives).toBe(2);
  });

  it('no-op on player entity', () => {
    const state = initialState();
    const result = applyOpponentRevives(state, makeEvent('0', '5'));
    expect(result).toBe(state);
  });

  it('reflected in state', () => {
    const state = initialState();
    const withOpp = {
      ...state,
      opponents: [
        {
          entityId: 200,
          playerId: 2,
          hero: { entityId: 200, cardId: 'Hero_BOT_02', hp: 30, armor: 3 },
          board: { minions: [] },
          tier: 5,
          eliminated: false,
          turnsPlayed: 3,
          revives: 0,
        },
      ],
    };
    const result = applyOpponentRevives(withOpp, makeEvent('200', '1'));
    expect(result.opponents[0].revives).toBe(1);
    expect(result.opponents[0].tier).toBe(5);
    expect(result.opponents[0].eliminated).toBe(false);
  });
});
