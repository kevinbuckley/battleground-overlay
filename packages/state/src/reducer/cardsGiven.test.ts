import { describe, expect, it } from 'bun:test';
import type { TagChange } from '@overlay/log-parser';
import { initialState } from '../initialState';
import { applyCardsGiven } from './cardsGiven';

function makeEvent(overrides: Partial<TagChange> = {}): TagChange {
  return {
    kind: 'TAG_CHANGE',
    entity: '0',
    tag: 'NUM_CARDS_GIVEN_THIS_TURN',
    value: '0',
    ...overrides,
  };
}

describe('applyCardsGiven', () => {
  it('initial value is 0', () => {
    const state = initialState();
    const result = applyCardsGiven(state, makeEvent({ value: '0' }));
    expect(result.player.cardsGivenThisTurn).toBe(0);
  });

  it('increments when shop gives free minion', () => {
    const state = initialState();
    const result = applyCardsGiven(state, makeEvent({ value: '3' }));
    expect(result.player.cardsGivenThisTurn).toBe(3);
  });

  it('no-op on opponent controller', () => {
    const state = initialState();
    const result = applyCardsGiven(state, makeEvent({ entity: '99' }));
    expect(result.player.cardsGivenThisTurn).toBe(0);
  });

  it('no-op on non-player controller', () => {
    const state = initialState();
    const result = applyCardsGiven(state, makeEvent({ entity: '5' }));
    expect(result.player.cardsGivenThisTurn).toBe(0);
  });
});
