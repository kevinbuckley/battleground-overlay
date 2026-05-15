import { describe, expect, it } from 'bun:test';
import { parseFullEntity } from './parseFullEntity';

describe('parseFullEntity', () => {
  it('parses FULL_ENTITY - Updating', () => {
    const line =
      'FULL_ENTITY - Updating Card=[name=Murloc Tidecaller id=42 cardId=CS2_168 type=MINION]';
    expect(parseFullEntity(line)).toEqual({
      kind: 'FULL_ENTITY',
      id: 42,
      cardId: 'CS2_168',
      name: 'Murloc Tidecaller',
    });
  });

  it('parses FULL_ENTITY - Creating', () => {
    const line = 'FULL_ENTITY - Creating ID=55 CardID=BGS_004';
    expect(parseFullEntity(line)).toEqual({
      kind: 'FULL_ENTITY',
      id: 55,
      cardId: 'BGS_004',
    });
  });

  it('returns null for unrelated lines', () => {
    expect(parseFullEntity('TAG_CHANGE Entity=1 tag=HEALTH value=30')).toBe(null);
    expect(parseFullEntity('')).toBe(null);
  });

  it('handles missing cardId field in Creating line', () => {
    const line = 'FULL_ENTITY - Creating ID=99';
    expect(parseFullEntity(line)).toEqual({
      kind: 'FULL_ENTITY',
      id: 99,
      cardId: '',
    });
  });

  it('handles missing cardId field in Updating line', () => {
    const line = 'FULL_ENTITY - Updating Card=[name=Murloc Tidecaller id=42]';
    expect(parseFullEntity(line)).toEqual({
      kind: 'FULL_ENTITY',
      id: 42,
      cardId: '',
      name: 'Murloc Tidecaller',
    });
  });
});
