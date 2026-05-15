import { describe, expect, it } from 'bun:test';
import type { TagChange } from '@overlay/log-parser';
import { initialState } from '../initialState';
import { applyPlayerTurnsPlayed } from './playerTurnsPlayed';

describe('applyPlayerTurnsPlayed', () => {
  it('sets turnsPlayed on player controller', () => {
    const state = initialState();
    const event: TagChange = {
      kind: 'TAG_CHANGE',
      entity: String(state.player.entityId),
      tag: 'NUM_TURNS_PLAYED',
      value: '5',
    };
    const next = applyPlayerTurnsPlayed(state, event);
    expect(next.player.turnsPlayed).toBe(5);
  });

  it('increments turnsPlayed on subsequent calls', () => {
    const state = initialState();
    const e1: TagChange = {
      kind: 'TAG_CHANGE',
      entity: String(state.player.entityId),
      tag: 'NUM_TURNS_PLAYED',
      value: '3',
    };
    const s1 = applyPlayerTurnsPlayed(state, e1);
    expect(s1.player.turnsPlayed).toBe(3);

    const e2: TagChange = {
      kind: 'TAG_CHANGE',
      entity: String(state.player.entityId),
      tag: 'NUM_TURNS_PLAYED',
      value: '7',
    };
    const s2 = applyPlayerTurnsPlayed(s1, e2);
    expect(s2.player.turnsPlayed).toBe(7);
  });

  it('no-op on opponent controller', () => {
    const state = initialState();
    const stateWithOpponent = {
      ...state,
      opponents: [
        {
          entityId: 100,
          playerId: 1,
          hero: { entityId: 100, cardId: 'TestHero', hp: 40, armor: 0 },
          board: { minions: [] },
          tier: 3,
          turnsPlayed: 0,
          eliminated: false,
        },
      ],
    };
    const event: TagChange = {
      kind: 'TAG_CHANGE',
      entity: '100',
      tag: 'NUM_TURNS_PLAYED',
      value: '5',
    };
    const next = applyPlayerTurnsPlayed(stateWithOpponent, event);
    expect(next).toBe(stateWithOpponent);
  });

  it('no-op on non-player entity', () => {
    const state = initialState();
    const event: TagChange = {
      kind: 'TAG_CHANGE',
      entity: '123',
      tag: 'NUM_TURNS_PLAYED',
      value: '5',
    };
    const next = applyPlayerTurnsPlayed(state, event);
    expect(next).toBe(state);
  });
});
