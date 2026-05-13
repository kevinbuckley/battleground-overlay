import { describe, expect, it } from 'bun:test';
import {
  getBgMinionsByTribe,
  isBattlegroundsMinion,
  isBattlegroundsPool,
} from './isBattlegroundsPool';
import type { Card } from './types';

const base: Card = { dbfId: 1, id: 'TST_001', name: 'Test', cardClass: 'NEUTRAL', cost: 0 };

describe('isBattlegroundsPool', () => {
  it('returns true for card with techLevel', () => {
    expect(isBattlegroundsPool({ ...base, techLevel: 1 })).toBe(true);
    expect(isBattlegroundsPool({ ...base, techLevel: 6 })).toBe(true);
  });

  it('returns true for card with BG tier mechanic', () => {
    expect(isBattlegroundsPool({ ...base, mechanics: ['BATTLEGROUND_MINION_TIER_3'] })).toBe(true);
  });

  it('returns false for non-BG card', () => {
    expect(isBattlegroundsPool({ ...base, mechanics: ['TAUNT'] })).toBe(false);
    expect(isBattlegroundsPool(base)).toBe(false);
  });
});

describe('getBgMinionsByTribe', () => {
  it('returns empty array when no cards loaded', () => {
    expect(getBgMinionsByTribe('Beast')).toEqual([]);
  });

  it('returns the same array on repeated calls for same tribe', () => {
    const a = getBgMinionsByTribe('Beast');
    const b = getBgMinionsByTribe('Beast');
    expect(a).toBe(b);
  });
});

describe('isBattlegroundsMinion', () => {
  it('returns true for tier-1 minion without passive buff', () => {
    expect(isBattlegroundsMinion({ ...base, techLevel: 1 })).toBe(true);
  });

  it('returns false for tier-7 minion (outside 1-6 range)', () => {
    expect(isBattlegroundsMinion({ ...base, techLevel: 7 })).toBe(false);
  });

  it('returns false for a spell (no techLevel)', () => {
    expect(isBattlegroundsMinion({ ...base, cost: 2 })).toBe(false);
  });

  it('returns false for card with DUNGEON_PASSIVE_BUFF mechanic', () => {
    expect(
      isBattlegroundsMinion({ ...base, techLevel: 3, mechanics: ['DUNGEON_PASSIVE_BUFF'] }),
    ).toBe(false);
  });
});
