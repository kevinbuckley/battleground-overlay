import { describe, expect, it } from 'bun:test';
import type { TagChange } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';
import { initialState } from '../initialState';
import { applyHeroPowerCardId } from './heroPowerCardId';

function makeEvent(overrides: Partial<TagChange>): TagChange {
  return {
    kind: 'TAG_CHANGE',
    entity: '0',
    tag: 'HERO_POWER_ID',
    value: 'HeroPower_General',
    ...overrides,
  };
}

describe('applyHeroPowerCardId', () => {
  it('sets heroPowerCardId on matching player entity', () => {
    const state: GameState = {
      ...initialState(),
      player: {
        ...initialState().player,
        entityId: 0,
        heroPowerCardId: null,
      },
    };
    const event = makeEvent({ entity: '0', value: 'HeroPower_General' });
    const result = applyHeroPowerCardId(state, event);
    expect(result.player.heroPowerCardId).toBe('HeroPower_General');
  });

  it('sets heroPowerCardId to null when value is empty', () => {
    const state: GameState = {
      ...initialState(),
      player: {
        ...initialState().player,
        entityId: 0,
        heroPowerCardId: 'HeroPower_General',
      },
    };
    const event = makeEvent({ entity: '0', value: '' });
    const result = applyHeroPowerCardId(state, event);
    expect(result.player.heroPowerCardId).toBeNull();
  });

  it('is no-op when entity does not match player', () => {
    const state: GameState = {
      ...initialState(),
      player: {
        ...initialState().player,
        entityId: 0,
        heroPowerCardId: null,
      },
    };
    const event = makeEvent({ entity: '99' });
    const result = applyHeroPowerCardId(state, event);
    expect(result.player.heroPowerCardId).toBeNull();
  });

  it('persists heroPowerCardId across turns', () => {
    let state: GameState = {
      ...initialState(),
      player: {
        ...initialState().player,
        entityId: 0,
        heroPowerCardId: null,
      },
    };
    state = applyHeroPowerCardId(state, makeEvent({ entity: '0', value: 'HeroPower_Mage' }));
    expect(state.player.heroPowerCardId).toBe('HeroPower_Mage');

    // Simulate turn increment via turnPhase
    const turnEvent: TagChange = {
      kind: 'TAG_CHANGE',
      entity: '0',
      tag: 'STEP',
      value: 'MAIN_READY',
    };
    // Import from the main reducer to test persistence through turn transition
    const { reducer } = require('../reducer');
    state = reducer(state, turnEvent);
    expect(state.player.heroPowerCardId).toBe('HeroPower_Mage');
  });
});
