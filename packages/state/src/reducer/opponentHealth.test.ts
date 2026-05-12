import { describe, expect, it } from 'bun:test';
import type { TagChange } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';
import { initialState } from '../initialState';
import { applyOpponentHealth } from './opponentHealth';

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

describe('applyOpponentHealth', () => {
  it('updates the matching opponent hero hp', () => {
    const state = makeOpponents();
    const event: TagChange = {
      kind: 'TAG_CHANGE',
      entity: '2',
      tag: 'HEALTH',
      value: '25',
    };
    const result = applyOpponentHealth(state, event);
    expect(result.opponents[1].hero.hp).toBe(25);
    expect(result.opponents[0].hero.hp).toBe(30);
    expect(result.opponents[2].hero.hp).toBe(20);
  });

  it('ignores entity id not found among opponents', () => {
    const state = makeOpponents();
    const event: TagChange = {
      kind: 'TAG_CHANGE',
      entity: '999',
      tag: 'HEALTH',
      value: '10',
    };
    const result = applyOpponentHealth(state, event);
    // Should return a new state object (not same reference) but with same values
    expect(result.opponents).toHaveLength(3);
    expect(result.opponents[0].hero.hp).toBe(30);
    expect(result.opponents[1].hero.hp).toBe(30);
    expect(result.opponents[2].hero.hp).toBe(20);
  });

  it('returns state unchanged for non-numeric entity', () => {
    const state = makeOpponents();
    const event: TagChange = {
      kind: 'TAG_CHANGE',
      entity: 'abc',
      tag: 'HEALTH',
      value: '10',
    };
    const result = applyOpponentHealth(state, event);
    expect(result.opponents).toHaveLength(3);
    expect(result.opponents[0].hero.hp).toBe(30);
  });

  it('returns state unchanged for non-numeric value', () => {
    const state = makeOpponents();
    const event: TagChange = {
      kind: 'TAG_CHANGE',
      entity: '1',
      tag: 'HEALTH',
      value: 'xyz',
    };
    const result = applyOpponentHealth(state, event);
    expect(result.opponents).toHaveLength(3);
    expect(result.opponents[0].hero.hp).toBe(30);
  });
});
