import { describe, expect, it } from 'bun:test';
import { findHsLogDirCandidates, parseLine } from './index';

describe('parseLine', () => {
  it('returns null for empty string', () => {
    expect(parseLine('')).toBe(null);
  });

  it('returns null for whitespace-only string', () => {
    expect(parseLine('   ')).toBe(null);
  });

  it('returns null for malformed TAG_CHANGE with no valid fields', () => {
    expect(parseLine('TAG_CHANGE Entity= tag= value=')).toBe(null);
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

  it('parses raw Power.log lines with Hearthstone debug prefix', () => {
    const result = parseLine(
      'D 14:22:08.1636210 GameState.DebugPrintPower() - TAG_CHANGE Entity=GameEntity tag=NUM_TURNS_IN_PLAY value=6 ',
    );
    expect(result).toEqual({
      kind: 'TAG_CHANGE',
      entity: 'GameEntity',
      entityRaw: 'GameEntity',
      tag: 'NUM_TURNS_IN_PLAY',
      value: '6',
    });
  });

  it('exports findHsLogDirCandidates as a function', () => {
    expect(typeof findHsLogDirCandidates).toBe('function');
  });
});
