import { describe, expect, it } from 'bun:test';
import { explain } from './index';

describe('explain', () => {
  it('returns empty string', () => {
    expect(explain({})).toBe('');
  });
});
