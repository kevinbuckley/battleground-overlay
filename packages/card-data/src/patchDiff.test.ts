import { describe, expect, it } from 'bun:test';
import { patchDiff } from './patchDiff';
import type { Card } from './types';

function makeCard(overrides: Partial<Card> = {}): Card {
  return {
    dbfId: 1,
    id: 'TEST_CARD',
    name: 'Test Card',
    cardClass: 'NEUTRAL',
    cost: 1,
    attack: 2,
    health: 3,
    ...overrides,
  };
}

describe('patchDiff', () => {
  it('returns empty arrays when both lists are empty', () => {
    const diff = patchDiff([], []);
    expect(diff.added).toEqual([]);
    expect(diff.removed).toEqual([]);
    expect(diff.statChanges).toEqual([]);
  });

  it('detects added cards by dbfId', () => {
    const oldCards: Card[] = [];
    const newCards: Card[] = [makeCard({ dbfId: 42, id: 'NEW_CARD' })];
    const diff = patchDiff(oldCards, newCards);
    expect(diff.added).toHaveLength(1);
    const addedCard = diff.added[0];
    expect(addedCard.dbfId).toBe(42);
    expect(diff.removed).toEqual([]);
  });

  it('detects removed cards by dbfId', () => {
    const oldCards: Card[] = [makeCard({ dbfId: 42, id: 'OLD_CARD' })];
    const newCards: Card[] = [];
    const diff = patchDiff(oldCards, newCards);
    expect(diff.removed).toHaveLength(1);
    const removedCard = diff.removed[0];
    expect(removedCard.dbfId).toBe(42);
    expect(diff.added).toEqual([]);
  });

  it('detects stat changes (cost/attack/health) for shared cards', () => {
    const oldCards: Card[] = [makeCard({ dbfId: 10, id: 'SHARED', cost: 2, attack: 3, health: 4 })];
    const newCards: Card[] = [makeCard({ dbfId: 10, id: 'SHARED', cost: 3, attack: 4, health: 5 })];
    const diff = patchDiff(oldCards, newCards);
    expect(diff.statChanges).toHaveLength(1);
    const sc = diff.statChanges[0];
    expect(sc.id).toBe('SHARED');
    expect(sc.oldStat).toBe('2|3|4');
    expect(sc.newStat).toBe('3|4|5');
  });

  it('returns empty arrays when passing the same array twice', () => {
    const cards = [
      makeCard({ dbfId: 1, id: 'A' }),
      makeCard({ dbfId: 2, id: 'B', cost: 3, attack: 4, health: 5 }),
    ];
    const diff = patchDiff(cards, cards);
    expect(diff.added).toEqual([]);
    expect(diff.removed).toEqual([]);
    expect(diff.statChanges).toEqual([]);
  });

  it('combines added, removed, and stat changes in one call', () => {
    const oldCards: Card[] = [
      makeCard({ dbfId: 1, id: 'KEEP' }),
      makeCard({ dbfId: 2, id: 'REMOVE', cost: 5 }),
    ];
    const newCards: Card[] = [
      makeCard({ dbfId: 1, id: 'KEEP', cost: 3 }),
      makeCard({ dbfId: 3, id: 'ADD' }),
    ];
    const diff = patchDiff(oldCards, newCards);
    expect(diff.added).toHaveLength(1);
    expect(diff.added[0].id).toBe('ADD');
    expect(diff.removed).toHaveLength(1);
    expect(diff.removed[0].id).toBe('REMOVE');
    expect(diff.statChanges).toHaveLength(1);
    expect(diff.statChanges[0].id).toBe('KEEP');
  });
});
