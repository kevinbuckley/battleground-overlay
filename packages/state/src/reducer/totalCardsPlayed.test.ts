import { expect, test } from 'bun:test';
import type { TagChange } from '@overlay/log-parser';
import { initialState } from '../initialState';
import { applyTotalCardsPlayed } from './totalCardsPlayed';

function makeEvent(tag: string, entity: string, value: string): TagChange {
  return { kind: 'TAG_CHANGE', entity, tag, value };
}

test('initial=0', () => {
  const state = initialState();
  expect(state.player.totalCardsPlayed).toBe(0);
});

test('increments on card play', () => {
  const state = initialState();
  const event = makeEvent('NUM_CARDS_PLAYED', '0', '5');
  const result = applyTotalCardsPlayed(state, event);
  expect(result.player.totalCardsPlayed).toBe(5);
});

test('no-op on opponent', () => {
  const state = initialState();
  const event = makeEvent('NUM_CARDS_PLAYED', '99', '5');
  const result = applyTotalCardsPlayed(state, event);
  expect(result.player.totalCardsPlayed).toBe(0);
});

test('reflected in state', () => {
  const state = initialState();
  const event = makeEvent('NUM_CARDS_PLAYED', '0', '12');
  const result = applyTotalCardsPlayed(state, event);
  expect(result.player.totalCardsPlayed).toBe(12);
});
