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

describe('sim benchmark', () => {
  it('runs 5 batches of n=20 in under 3000ms total', () => {
    const start = performance.now();
    for (let i = 0; i < 5; i++) {
      simulateBatch(board, board, 20, i * 100);
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(3000);
  });
});
