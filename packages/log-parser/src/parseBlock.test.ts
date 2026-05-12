import { describe, expect, it } from 'bun:test';
import { parseBlockEnd, parseBlockStart } from './parseBlock';

describe('parseBlockStart', () => {
  it('parses a TRIGGER block start', () => {
    const line =
      'BLOCK_START BlockType=TRIGGER Entity=GameEntity EffectCardId=TB_BaconShop_StartGame EffectIndex=0 Target=0 SubOption=-1 TriggerKeyword=NONE';
    const result = parseBlockStart(line);
    expect(result).toMatchObject({
      kind: 'BLOCK_START',
      blockType: 'TRIGGER',
      entity: 'GameEntity',
      effectCardId: 'TB_BaconShop_StartGame',
      effectIndex: 0,
    });
  });

  it('returns null for unrelated lines', () => {
    expect(parseBlockStart('TAG_CHANGE Entity=1 tag=HEALTH value=30')).toBe(null);
  });
});

describe('parseBlockEnd', () => {
  it('parses BLOCK_END', () => {
    expect(parseBlockEnd('BLOCK_END')).toEqual({ kind: 'BLOCK_END' });
  });

  it('parses indented BLOCK_END', () => {
    expect(parseBlockEnd('    BLOCK_END')).toEqual({ kind: 'BLOCK_END' });
  });

  it('returns null for unrelated lines', () => {
    expect(parseBlockEnd('BLOCK_START ...')).toBe(null);
  });
});
