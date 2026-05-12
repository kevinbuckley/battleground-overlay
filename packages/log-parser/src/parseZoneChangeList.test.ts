import { describe, expect, it } from 'bun:test';
import { parseZoneChangeList } from './parseZoneChangeList';

describe('parseZoneChangeList', () => {
  it('parses a valid ZONE_CHANGE_LIST line', () => {
    const result = parseZoneChangeList('ZONE_CHANGE_LIST ID=42');
    expect(result).toEqual({ kind: 'ZONE_CHANGE_LIST', id: 42 });
  });

  it('returns null for garbage input', () => {
    expect(parseZoneChangeList('SOME_RANDOM_LOG_LINE')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(parseZoneChangeList('')).toBeNull();
  });
});
