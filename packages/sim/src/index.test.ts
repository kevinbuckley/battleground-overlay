import { describe, expect, it } from 'bun:test';
import { simulateBatch } from './index';

describe('simulateBatch', () => {
  it('returns zero counts', () => {
    const result = simulateBatch();
    expect(result).toEqual({ wins: 0, losses: 0, ties: 0 });
  });
});
