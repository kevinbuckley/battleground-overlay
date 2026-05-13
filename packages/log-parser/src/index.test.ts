import { describe, expect, it } from 'bun:test';
import { parseLine } from './index';

describe('parseLine', () => {
  it('returns null for empty string', () => {
    expect(parseLine('')).toBe(null);
  });

  it('parses ZONE_CHANGE_LIST lines', () => {
    const result = parseLine('ZONE_CHANGE_LIST ID=99');
    expect(result).toEqual({ kind: 'ZONE_CHANGE_LIST', id: 99 });
  });

  it('parses SHOW_ENTITY lines', () => {
    const result = parseLine('SHOW_ENTITY - Updating Entity=5 CardID=CS2_168');
    expect(result).toEqual({
      kind: 'SHOW_ENTITY',
      entity: '5',
      cardId: 'CS2_168',
    });
  });
});
