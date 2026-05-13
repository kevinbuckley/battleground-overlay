import { describe, expect, it } from 'bun:test';
import {
  getByDbfId,
  getCard,
  getCardsByTechLevel,
  getCardsByTier,
  getCardsByTribe,
} from './indexes';

describe('getCard', () => {
  it('returns null for unknown dbfId', () => {
    expect(getCard(-1)).toBe(null);
  });

  it('returns the same Map on repeated calls', () => {
    expect(getByDbfId()).toBe(getByDbfId());
  });
});

describe('getCardsByTribe', () => {
  it('returns empty array when no cards loaded', () => {
    expect(getCardsByTribe('Beast')).toEqual([]);
  });

  it('returns the same array on repeated calls for same tribe', () => {
    const a = getCardsByTribe('Beast');
    const b = getCardsByTribe('Beast');
    expect(a).toBe(b);
  });
});

describe('getCardsByTier', () => {
  it('returns empty array when no cards loaded', () => {
    expect(getCardsByTier(1)).toEqual([]);
  });

  it('returns the same array on repeated calls for same tier', () => {
    const a = getCardsByTier(1);
    const b = getCardsByTier(1);
    expect(a).toBe(b);
  });
});

describe('getCardsByTechLevel', () => {
  it('returns empty array when no cards loaded', () => {
    expect(getCardsByTechLevel(1)).toEqual([]);
  });

  it('returns the same array on repeated calls for same tech level', () => {
    const a = getCardsByTechLevel(1);
    const b = getCardsByTechLevel(1);
    expect(a).toBe(b);
  });

  it('lazy init does not double-build', () => {
    const before = getCardsByTechLevel(7);
    const after = getCardsByTechLevel(7);
    expect(before).toBe(after);
  });
});
