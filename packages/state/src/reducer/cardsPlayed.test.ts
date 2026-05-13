import { describe, expect, it } from 'bun:test';
import type { HsEvent, TagChange } from '@overlay/log-parser';
import { initialState } from '../initialState';
import { applyCardsPlayed } from './cardsPlayed';

function makeEvent(entity: string, value: string): TagChange {
  return {
    kind: 'TAG_CHANGE',
    entity,
    tag: 'NUM_CARDS_PLAYED_THIS_TURN',
    value,
  };
}

describe('applyCardsPlayed', () => {
  it('initial state has cardsPlayedThisTurn = 0', () => {
    const state = initialState();
    expect(state.player.cardsPlayedThisTurn).toBe(0);
  });

  it('updates cardsPlayedThisTurn when entity matches player', () => {
    const state = initialState();
    const event = makeEvent(String(state.player.entityId), '3');
    const result = applyCardsPlayed(state, event);
    expect(result.player.cardsPlayedThisTurn).toBe(3);
  });

  it('no-op when entity does not match player', () => {
    const state = initialState();
    const event = makeEvent('999', '3');
    const result = applyCardsPlayed(state, event);
    expect(result.player.cardsPlayedThisTurn).toBe(0);
  });

  it('no-op when tag is not NUM_CARDS_PLAYED_THIS_TURN', () => {
    const state = initialState();
    const event = {
      kind: 'TAG_CHANGE',
      entity: String(state.player.entityId),
      tag: 'HEALTH',
      value: '30',
    } as TagChange;
    const result = applyCardsPlayed(state, event as HsEvent);
    expect(result.player.cardsPlayedThisTurn).toBe(0);
  });
});
