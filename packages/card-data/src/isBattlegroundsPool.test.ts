import { describe, expect, it } from 'bun:test';
import { getBgMinionsByTribe, isBattlegroundsPool } from './isBattlegroundsPool';
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
