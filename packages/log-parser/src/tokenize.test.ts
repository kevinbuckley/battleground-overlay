import { describe, expect, it } from 'bun:test';
import { tokenizeLine } from './tokenize';

describe('tokenizeLine', () => {
  it('parses top-level line', () => {
    const result = tokenizeLine('TAG_CHANGE Entity=4 tag=HEALTH value=30');
    expect(result).toEqual({
      depth: 0,
      kind: 'TAG_CHANGE',
      payload: 'Entity=4 tag=HEALTH value=30',
    });
  });

  it('parses indented line at depth 1', () => {
    const result = tokenizeLine('    BLOCK_END');
    expect(result).toEqual({ depth: 1, kind: 'BLOCK_END', payload: '' });
  });

  it('returns null for empty line', () => {
    expect(tokenizeLine('')).toBe(null);
    expect(tokenizeLine('   ')).toBe(null);
  });
});
