import { describe, expect, it } from 'bun:test';
import type { TagChange } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';
import { initialState } from '../initialState';
import { applyOpponentTier } from './opponentTier';

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

describe('applyOpponentTier', () => {
  it('updates the matching opponent tier', () => {
    const state = makeOpponents();
    const event: TagChange = {
      kind: 'TAG_CHANGE',
      entity: '2',
      tag: 'PLAYER_TECH_LEVEL',
      value: '7',
    };
    const result = applyOpponentTier(state, event);
    expect(result.opponents[0].tier).toBe(3);
    expect(result.opponents[1].tier).toBe(7);
    expect(result.opponents[2].tier).toBe(5);
  });

  it('handles tier 3→5 update as specified in task', () => {
    const state = makeOpponents();
    const event: TagChange = {
      kind: 'TAG_CHANGE',
      entity: '1',
      tag: 'PLAYER_TECH_LEVEL',
      value: '5',
    };
    const result = applyOpponentTier(state, event);
    expect(result.opponents[0].tier).toBe(5);
    expect(result.opponents[1].tier).toBe(4);
    expect(result.opponents[2].tier).toBe(5);
  });

  it('ignores entity id not found among opponents', () => {
    const state = makeOpponents();
    const event: TagChange = {
      kind: 'TAG_CHANGE',
      entity: '999',
      tag: 'PLAYER_TECH_LEVEL',
      value: '10',
    };
    const result = applyOpponentTier(state, event);
    expect(result.opponents).toHaveLength(3);
    expect(result.opponents[0].tier).toBe(3);
    expect(result.opponents[1].tier).toBe(4);
    expect(result.opponents[2].tier).toBe(5);
  });

  it('returns state unchanged for non-numeric entity', () => {
    const state = makeOpponents();
    const event: TagChange = {
      kind: 'TAG_CHANGE',
      entity: 'abc',
      tag: 'PLAYER_TECH_LEVEL',
      value: '10',
    };
    const result = applyOpponentTier(state, event);
    expect(result.opponents).toHaveLength(3);
    expect(result.opponents[0].tier).toBe(3);
  });

  it('returns state unchanged for non-numeric value', () => {
    const state = makeOpponents();
    const event: TagChange = {
      kind: 'TAG_CHANGE',
      entity: '1',
      tag: 'PLAYER_TECH_LEVEL',
      value: 'xyz',
    };
    const result = applyOpponentTier(state, event);
    expect(result.opponents).toHaveLength(3);
    expect(result.opponents[0].tier).toBe(3);
  });
});
