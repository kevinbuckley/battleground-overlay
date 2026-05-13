import { describe, expect, it } from 'bun:test';
import type { TagChange } from '@overlay/log-parser';
import { initialState } from '../initialState';
import { applyCardsInDeck } from './cardsInDeck';

describe('applyCardsInDeck', () => {
  it('initial state has deckSize 30', () => {
    const state = initialState();
    expect(state.player.deckSize).toBe(30);
  });

  it('updates deckSize when tag matches on player controller', () => {
    const state = initialState();
    const event: TagChange = {
      kind: 'TAG_CHANGE',
      entity: String(state.player.hero.entityId),
      tag: 'NUM_CARDS_IN_DECK',
      value: '29',
    };
    const result = applyCardsInDeck(state, event);
    expect(result.player.deckSize).toBe(29);
  });

  it('no-op when entity is not player controller', () => {
    const state = initialState();
    const event: TagChange = {
      kind: 'TAG_CHANGE',
      entity: '999',
      tag: 'NUM_CARDS_IN_DECK',
      value: '29',
    };
    const result = applyCardsInDeck(state, event);
    expect(result).toBe(state);
  });

  it('no-op when tag does not match', () => {
    const state = initialState();
    const event: TagChange = {
      kind: 'TAG_CHANGE',
      entity: String(state.player.hero.entityId),
      tag: 'HEALTH',
      value: '30',
    };
    const result = applyCardsInDeck(state, event);
    expect(result).toBe(state);
  });
});
