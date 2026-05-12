import { describe, expect, it } from 'bun:test';
import { parseLine } from './index';

describe('parseLine', () => {
  it('returns null for empty string', () => {
    expect(parseLine('')).toBe(null);
  });
});
