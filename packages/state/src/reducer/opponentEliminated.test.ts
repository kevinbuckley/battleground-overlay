import { describe, expect, it } from 'bun:test';
import type { TagChange } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';
import { initialState } from '../initialState';
import { applyOpponentEliminated } from './opponentEliminated';

function makeOpponents(): GameState {
  return {
    ...initialState(),
    opponents: [
      {
        entityId: 1,
        playerId: 1,
        hero: { entityId: 1, cardId: '', hp: 30, armor: 0 },
        board: { minions: [] },
        tier: 3,
        eliminated: false,
      },
      {
        entityId: 2,
        playerId: 2,
        hero: { entityId: 2, cardId: '', hp: 30, armor: 0 },
        board: { minions: [] },
        tier: 4,
        eliminated: false,
      },
      {
        entityId: 3,
        playerId: 3,
        hero: { entityId: 3, cardId: '', hp: 20, armor: 0 },
        board: { minions: [] },
        tier: 5,
        eliminated: false,
      },
    ],
  };
}

describe('applyOpponentEliminated', () => {
  it('sets eliminated when HP=0 on an opponent', () => {
    const state = makeOpponents();
    const event: TagChange = {
      kind: 'TAG_CHANGE',
      entity: '2',
      tag: 'HEALTH',
      value: '0',
    };
    const result = applyOpponentEliminated(state, event);
    expect(result.opponents[0].eliminated).toBe(false);
    expect(result.opponents[1].eliminated).toBe(true);
    expect(result.opponents[2].eliminated).toBe(false);
  });

  it('is a no-op when HP > 0', () => {
    const state = makeOpponents();
    const event: TagChange = {
      kind: 'TAG_CHANGE',
      entity: '2',
      tag: 'HEALTH',
      value: '5',
    };
    const result = applyOpponentEliminated(state, event);
    expect(result.opponents[1].eliminated).toBe(false);
  });

  it('only marks the matching opponent when multiple exist', () => {
    const state = makeOpponents();
    const event: TagChange = {
      kind: 'TAG_CHANGE',
      entity: '3',
      tag: 'HEALTH',
      value: '0',
    };
    const result = applyOpponentEliminated(state, event);
    expect(result.opponents[0].eliminated).toBe(false);
    expect(result.opponents[1].eliminated).toBe(false);
    expect(result.opponents[2].eliminated).toBe(true);
  });

  it('stays eliminated if already eliminated', () => {
    const state = makeOpponents();
    const stateCopy: GameState = {
      ...state,
      opponents: state.opponents.map((o, i) => (i === 0 ? { ...o, eliminated: true } : o)),
    };
    const event: TagChange = {
      kind: 'TAG_CHANGE',
      entity: '1',
      tag: 'HEALTH',
      value: '0',
    };
    const result = applyOpponentEliminated(stateCopy, event);
    expect(result.opponents[0].eliminated).toBe(true);
  });
});
