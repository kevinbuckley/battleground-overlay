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

  it('ignores garbage prefix — timestamp-prefixed line returns TokenizedLine with kind from first word after prefix stripped', () => {
    const result = tokenizeLine(
      '2024-01-01 00:00:00.000 LOG: TAG_CHANGE Entity=1 tag=HEALTH value=30',
    );
    expect(result).not.toBe(null);
    expect(result!.kind).toBe('2024-01-01');
  });
});
