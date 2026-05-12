import { describe, expect, it } from 'bun:test';
import { toFirestoneBoard } from './adapter';
import type { Board, Minion, PlayerState } from '@overlay/shared';

const minion: Minion = {
  entityId: 10,
  cardId: 'CS2_168',
  attack: 3,
  health: 4,
  taunt: false,
  divineShield: false,
  poisonous: false,
  reborn: false,
  frozen: false,
  tribes: [],
};

const playerState: PlayerState = {
  entityId: 2,
  playerId: 1,
  hero: { entityId: 3, cardId: 'TB_BaconShop_HERO_KelThuzad', hp: 30, armor: 0 },
  board: { minions: [minion] },
  shop: { minions: [], frozen: false, rollCost: 1 },
  gold: 7,
  tier: 3,
  tierUpCost: 4,
  eliminated: false,
};

describe('toFirestoneBoard', () => {
  it('converts board minions to Firestone entities', () => {
    const board: Board = { minions: [minion] };
    const result = toFirestoneBoard(board, playerState);

    expect(result.board).toHaveLength(1);
    expect(result.board[0]).toMatchObject({
      entityId: 10,
      cardId: 'CS2_168',
      attack: 3,
      health: 4,
    });
  });

  it('sets player tavernTier from player.tier', () => {
    const result = toFirestoneBoard({ minions: [] }, playerState);
    expect(result.player.tavernTier).toBe(3);
    expect(result.player.hpLeft).toBe(30);
  });
});
