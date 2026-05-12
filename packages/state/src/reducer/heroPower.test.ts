import { describe, expect, it } from 'bun:test';
import type { TagChange } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';
import { initialState } from '../initialState';
import { applyHeroPower } from './heroPower';

function makeEvent(used: number): TagChange {
  return {
    kind: 'TAG_CHANGE',
    entity: '1',
    tag: 'NUM_TIMES_HERO_POWER_USED_THIS_GAME',
    value: String(used),
  };
}

function makeOpponentEvent(used: number): TagChange {
  return {
    kind: 'TAG_CHANGE',
    entity: '100',
    tag: 'NUM_TIMES_HERO_POWER_USED_THIS_GAME',
    value: String(used),
  };
}

function makeWrongTag(): TagChange {
  return {
    kind: 'TAG_CHANGE',
    entity: '1',
    tag: 'HEALTH',
    value: '30',
  };
}

function makeState(): GameState {
  return {
    ...initialState(),
    player: {
      ...initialState().player,
      entityId: 1,
    },
  };
}

describe('applyHeroPower', () => {
  it('sets heroPowerUsedThisTurn=true when value > 0 on own controller', () => {
    const state = makeState();
    const result = applyHeroPower(state, makeEvent(1));
    expect(result.player.heroPowerUsedThisTurn).toBe(true);
  });

  it('sets heroPowerUsedThisTurn=false when value is 0 on own controller', () => {
    const state = makeState();
    const result = applyHeroPower(state, makeEvent(0));
    expect(result.player.heroPowerUsedThisTurn).toBe(false);
  });

  it('ignores events from opponent controllers', () => {
    const state = makeState();
    const result = applyHeroPower(state, makeOpponentEvent(1));
    expect(result.player.heroPowerUsedThisTurn).toBe(false);
  });

  it('ignores non-matching tags', () => {
    const state = makeState();
    const result = applyHeroPower(state, makeWrongTag());
    expect(result.player.heroPowerUsedThisTurn).toBe(false);
  });
});
