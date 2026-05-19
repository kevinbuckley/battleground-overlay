import { describe, expect, it } from 'bun:test';
import type { BgsBoardInfo } from '@firestone-hs/simulate-bgs-battle/dist/bgs-board-info';
import { simulateBatch } from './simulateBatch';

const board: BgsBoardInfo = {
  player: {
    cardId: 'TB_BaconShop_HERO_KelThuzad',
    hpLeft: 40,
    tavernTier: 1,
    heroPowers: [],
    questEntities: [],
  },
  board: [
    { entityId: 1, cardId: 'CS2_168', attack: 2, health: 1 },
    { entityId: 2, cardId: 'CS2_168', attack: 1, health: 2 },
  ],
};

describe('simulateBatch', () => {
  it('returns a BatchResult with wins/losses/ties', () => {
    const result = simulateBatch(board, board, 10);
    expect(typeof result.wins).toBe('number');
    expect(typeof result.losses).toBe('number');
    expect(typeof result.ties).toBe('number');
  });

  it('produces same result when called twice (determinism)', () => {
    const r1 = simulateBatch(board, board, 20, 42);
    const r2 = simulateBatch(board, board, 20, 42);
    expect(r1.wins).toBe(r2.wins);
    expect(r1.losses).toBe(r2.losses);
    expect(r1.ties).toBe(r2.ties);
  });

  it('is deterministic even when no explicit seed is provided', () => {
    const r1 = simulateBatch(board, board, 20);
    const r2 = simulateBatch(board, board, 20);
    expect(r1).toEqual(r2);
  });

  it('restores Math.random after seeded simulation', () => {
    const originalRandom = Math.random;
    simulateBatch(board, board, 1, 7);
    expect(Math.random).toBe(originalRandom);
  });
});
