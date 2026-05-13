import { describe, expect, it } from 'bun:test';
import type { HsEvent } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';
import { initialState } from '../initialState';
import { applyMinionsKilled } from './minionsKilled';

function makeEvent(value: string, entity?: string): HsEvent {
  return {
    kind: 'TAG_CHANGE',
    entity: entity ?? '0',
    tag: 'NUM_MINIONS_KILLED_THIS_TURN',
    value,
  };
}

describe('applyMinionsKilled', () => {
  it('initial value is 0', () => {
    const state = initialState();
    expect(state.player.minionsKilledThisTurn).toBe(0);
  });

  it('updates minionsKilledThisTurn from TAG_CHANGE', () => {
    const state: GameState = {
      ...initialState(),
      player: {
        ...initialState().player,
        entityId: 0,
      },
    };
    const event = makeEvent('5');
    const result = applyMinionsKilled(state, event);
    expect(result.player.minionsKilledThisTurn).toBe(5);
  });

  it('no-op when entity is not player controller', () => {
    const state: GameState = {
      ...initialState(),
      player: {
        ...initialState().player,
        entityId: 0,
      },
    };
    const event = makeEvent('5', '99');
    const result = applyMinionsKilled(state, event);
    expect(result.player.minionsKilledThisTurn).toBe(0);
  });

  it('no-op when tag is not NUM_MINIONS_KILLED_THIS_TURN', () => {
    const state: GameState = {
      ...initialState(),
      player: {
        ...initialState().player,
        entityId: 0,
      },
    };
    const event = {
      kind: 'TAG_CHANGE',
      entity: '0',
      tag: 'SOME_OTHER_TAG',
      value: '5',
    } as HsEvent;
    const result = applyMinionsKilled(state, event);
    expect(result.player.minionsKilledThisTurn).toBe(0);
  });
});
