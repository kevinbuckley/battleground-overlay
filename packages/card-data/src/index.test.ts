import { describe, expect, it } from 'bun:test';
import { getCard } from './index';

describe('getCard', () => {
  it('returns null for any dbfId', () => {
    expect(getCard(42)).toBe(null);
  });
});
