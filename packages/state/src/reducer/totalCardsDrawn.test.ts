import { expect, test } from 'bun:test';
import type { TagChange } from '@overlay/log-parser';
import { initialState } from '../initialState';
import { applyTotalCardsDrawn } from './totalCardsDrawn';

function makeEvent(tag: string, entity: string, value: string): TagChange {
  return { kind: 'TAG_CHANGE', entity, tag, value };
}

test('initial=0', () => {
  const state = initialState();
  expect(state.player.totalCardsDrawn).toBe(0);
});

test('increments on card draw', () => {
  const state = initialState();
  const event = makeEvent('NUM_CARDS_DRAWN', '0', '5');
  const result = applyTotalCardsDrawn(state, event);
  expect(result.player.totalCardsDrawn).toBe(5);
});

test('no-op on opponent', () => {
  const state = initialState();
  const event = makeEvent('NUM_CARDS_DRAWN', '99', '5');
  const result = applyTotalCardsDrawn(state, event);
  expect(result.player.totalCardsDrawn).toBe(0);
});

test('reflected in state', () => {
  const state = initialState();
  const event = makeEvent('NUM_CARDS_DRAWN', '0', '12');
  const result = applyTotalCardsDrawn(state, event);
  expect(result.player.totalCardsDrawn).toBe(12);
});
