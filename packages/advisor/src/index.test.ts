import { describe, expect, it } from 'bun:test';
import { recommend } from './index';
import { initialState } from '@overlay/state';

describe('advisor index', () => {
  it('recommend returns array for empty initial state', () => {
    expect(Array.isArray(recommend(initialState()))).toBe(true);
  });
});
