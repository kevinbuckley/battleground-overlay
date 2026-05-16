import { describe, expect, it } from 'bun:test';
import { getCard } from './index';

describe('getCard', () => {
  it('returns null for an unknown dbfId', () => {
    expect(getCard(-1)).toBe(null);
  });
});
