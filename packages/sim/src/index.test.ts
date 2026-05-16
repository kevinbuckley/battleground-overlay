import { describe, expect, it } from 'bun:test';
import type { BgsBoardInfo } from '@firestone-hs/simulate-bgs-battle/dist/bgs-board-info';
import { simulateBatch } from './index';

const board: BgsBoardInfo = {
  player: {
    cardId: 'TB_BaconShop_HERO_KelThuzad',
    hpLeft: 40,
    tavernTier: 1,
    heroPowers: [],
    questEntities: [],
  },
  board: [],
};

describe('simulateBatch', () => {
  it('returns count fields for a valid empty-board matchup', () => {
    const result = simulateBatch(board, board, 1);
    expect(typeof result.wins).toBe('number');
    expect(typeof result.losses).toBe('number');
    expect(typeof result.ties).toBe('number');
  });
});
