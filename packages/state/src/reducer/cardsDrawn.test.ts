import { describe, expect, it } from 'bun:test';
import type { HsEvent, TagChange } from '@overlay/log-parser';
import { initialState } from '../initialState';
import { applyCardsDrawn } from './cardsDrawn';

function makeEvent(entity: string, value: string): TagChange {
  return {
    kind: 'TAG_CHANGE',
    entity,
    tag: 'NUM_CARDS_DRAWN_THIS_TURN',
    value,
  };
}

describe('applyCardsDrawn', () => {
  it('initial state has cardsDrawnThisTurn = 0', () => {
    const state = initialState();
    expect(state.player.cardsDrawnThisTurn).toBe(0);
  });

  it('updates cardsDrawnThisTurn when entity matches player', () => {
    const state = initialState();
    const event = makeEvent(String(state.player.entityId), '3');
    const result = applyCardsDrawn(state, event as HsEvent);
    expect(result.player.cardsDrawnThisTurn).toBe(3);
  });

  it('no-op when entity does not match player', () => {
    const state = initialState();
    const event = makeEvent('999', '3');
    const result = applyCardsDrawn(state, event as HsEvent);
    expect(result.player.cardsDrawnThisTurn).toBe(0);
  });

  it('no-op when tag is not NUM_CARDS_DRAWN_THIS_TURN', () => {
    const state = initialState();
    const event = {
      kind: 'TAG_CHANGE',
      entity: String(state.player.entityId),
      tag: 'HEALTH',
      value: '30',
    } as TagChange;
    const result = applyCardsDrawn(state, event as HsEvent);
    expect(result.player.cardsDrawnThisTurn).toBe(0);
  });
});
