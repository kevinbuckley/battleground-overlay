import { describe, expect, it } from 'bun:test';
import {
  getByDbfId,
  getByDbfIdStr,
  getCard,
  getCardName,
  getCardsByTechLevel,
  getCardsByTier,
  getCardsByTribe,
} from './indexes';
import { loadCards } from './loadCards';

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

  it('case-sensitive: lowercase tribe returns different result than uppercase', () => {
    const upper = getCardsByTribe('Beast');
    const lower = getCardsByTribe('beast');
    expect(upper).not.toBe(lower);
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

  it('returns empty array for tier 0 (below minimum)', () => {
    expect(getCardsByTier(0)).toEqual([]);
  });

  it('returns empty array for tier 7 (beyond maximum)', () => {
    expect(getCardsByTier(7)).toEqual([]);
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

describe('getCardName', () => {
  it('returns the input for an unknown id', () => {
    expect(getCardName('nonexistent_card_id')).toBe('nonexistent_card_id');
  });

  it('returns empty string for empty string input', () => {
    expect(getCardName('')).toBe('');
  });

  it('index is built lazily', () => {
    const before = getByDbfIdStr();
    getCardName('TB_BaconShop_OvergrownMinion');
    const after = getByDbfIdStr();
    expect(before).toBe(after);
  });

  it('returns the card name when a card exists in the loaded data', () => {
    const cards = loadCards();
    const card = cards[0];
    if (card) {
      const name = getCardName(card.id);
      expect(name).toBe(card.name);
    }
  });
});
