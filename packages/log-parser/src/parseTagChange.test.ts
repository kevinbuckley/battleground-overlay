import { describe, expect, it } from 'bun:test';
import { parseTagChange } from './parseTagChange';

describe('parseTagChange', () => {
  it('parses a health tag change', () => {
    expect(parseTagChange('TAG_CHANGE Entity=4 tag=HEALTH value=30')).toEqual({
      kind: 'TAG_CHANGE',
      entity: '4',
      tag: 'HEALTH',
      value: '30',
    });
  });

  it('parses a named-entity tag change', () => {
    expect(parseTagChange('TAG_CHANGE Entity=GameEntity tag=STEP value=MAIN_ACTION')).toEqual({
      kind: 'TAG_CHANGE',
      entity: 'GameEntity',
      tag: 'STEP',
      value: 'MAIN_ACTION',
    });
  });

  it('parses with quoted entity names', () => {
    expect(
      parseTagChange('TAG_CHANGE Entity=[name=Murloc Tidecaller id=42] tag=ATK value=3'),
    ).toEqual({
      kind: 'TAG_CHANGE',
      entity: '[name=Murloc Tidecaller id=42]',
      tag: 'ATK',
      value: '3',
    });
  });

  it('returns null for non-tag-change line', () => {
    expect(parseTagChange('BLOCK_START ...')).toBe(null);
    expect(parseTagChange('')).toBe(null);
  });

  it('parses quoted value with quotes included in value field', () => {
    expect(parseTagChange('TAG_CHANGE Entity=5 tag=ZONE value="PLAY"')).toEqual({
      kind: 'TAG_CHANGE',
      entity: '5',
      tag: 'ZONE',
      value: '"PLAY"',
    });
  });

  it('handles entity names containing spaces', () => {
    expect(parseTagChange('TAG_CHANGE Entity=Some Player tag=ZONE value=PLAY')).toEqual({
      kind: 'TAG_CHANGE',
      entity: 'Some Player',
      tag: 'ZONE',
      value: 'PLAY',
    });
  });

  it('parses numeric entity with space-containing tag value', () => {
    expect(parseTagChange('TAG_CHANGE Entity=1 tag=ZONE value=HAND')).toEqual({
      kind: 'TAG_CHANGE',
      entity: '1',
      tag: 'ZONE',
      value: 'HAND',
    });
  });
});
