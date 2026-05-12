import { describe, expect, it } from 'bun:test';
import { getCard, getByDbfId } from './indexes';

describe('getCard', () => {
  it('returns null for unknown dbfId', () => {
    expect(getCard(-1)).toBe(null);
  });

  it('returns the same Map on repeated calls', () => {
    expect(getByDbfId()).toBe(getByDbfId());
  });
});
