import { describe, expect, it } from 'bun:test';
import { parseShowEntity } from './parseShowEntity';

describe('parseShowEntity', () => {
  it('parses a valid SHOW_ENTITY line', () => {
    const line = 'SHOW_ENTITY - Updating Entity=123 CardID=TB_BaconHeroes_83';
    const result = parseShowEntity(line);
    expect(result).toEqual({
      kind: 'SHOW_ENTITY',
      entity: '123',
      cardId: 'TB_BaconHeroes_83',
    });
  });

  it('returns null for a line without CardID', () => {
    const line = 'SHOW_ENTITY - Updating Entity=456';
    const result = parseShowEntity(line);
    expect(result).toBe(null);
  });

  it('returns null for an unrelated line', () => {
    const line = 'TAG_CHANGE Entity=0 tag=HEALTH value=30';
    const result = parseShowEntity(line);
    expect(result).toBe(null);
  });
});
