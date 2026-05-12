import { describe, expect, it } from 'bun:test';
import { loadCards } from './loadCards';

describe('loadCards', () => {
  it('returns an array (empty if cards.json not present)', () => {
    const cards = loadCards();
    expect(Array.isArray(cards)).toBe(true);
  });

  it('returns the same reference on second call (caching)', () => {
    expect(loadCards()).toBe(loadCards());
  });
});
