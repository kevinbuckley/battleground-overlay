import { describe, expect, it } from 'bun:test';
import type { Board, Minion, PlayerState } from '@overlay/shared';
import { bgsFormatToBoard, toFirestoneBoard } from './adapter';

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
  golden: false,
  windfury: false,
  cleave: false,
  elite: false,
  cost: 0,
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
  hand: [],
  pendingTriple: null,
  heroPowerUsedThisTurn: false,
  handSize: 0,
  trinketUsed: false,
  cardsPlayedThisTurn: 0,
  cardsGivenThisTurn: 0,
  deckSize: 30,
  heroPowerCardId: null,
  turnsInGame: 0,
  minionsOnBoard: 0,
  minionsKilledThisTurn: 0,
  cardsDrawnThisTurn: 0,
  goldSpentThisTurn: 0,
  shopSize: 3,
  entityRegistry: new Map(),
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

  it('passes combat mechanics that affect attack order to Firestone', () => {
    const board: Board = { minions: [{ ...minion, windfury: true, cleave: true }] };
    const result = toFirestoneBoard(board, playerState);

    expect(result.board[0]).toMatchObject({
      windfury: true,
      cleave: true,
    });
  });

  it('sets player tavernTier from player.tier', () => {
    const result = toFirestoneBoard({ minions: [] }, playerState);
    expect(result.player.tavernTier).toBe(3);
    expect(result.player.hpLeft).toBe(30);
  });
});

describe('bgsFormatToBoard', () => {
  it('converts Firestone board entities back to our Board', () => {
    const board: Board = { minions: [minion] };
    const firestone = toFirestoneBoard(board, playerState);
    const back = bgsFormatToBoard(firestone);

    expect(back.minions).toHaveLength(1);
    const m = back.minions[0];
    expect(m.cardId).toBe('CS2_168');
    expect(m.attack).toBe(3);
    expect(m.health).toBe(4);
  });

  it('roundtrips a 2-minion board preserving cardId, attack, health', () => {
    const board: Board = {
      minions: [
        { ...minion, entityId: 10, cardId: 'TB_BaconShop_Min1', attack: 2, health: 3 },
        { ...minion, entityId: 11, cardId: 'TB_BaconShop_Min2', attack: 4, health: 5 },
      ],
    };
    const firestone = toFirestoneBoard(board, playerState);
    const back = bgsFormatToBoard(firestone);

    expect(back.minions).toHaveLength(2);
    const m0 = back.minions[0];
    const m1 = back.minions[1];
    expect(m0.cardId).toBe('TB_BaconShop_Min1');
    expect(m0.attack).toBe(2);
    expect(m0.health).toBe(3);
    expect(m1.cardId).toBe('TB_BaconShop_Min2');
    expect(m1.attack).toBe(4);
    expect(m1.health).toBe(5);
  });

  it('handles empty board', () => {
    const firestone = toFirestoneBoard({ minions: [] }, playerState);
    const back = bgsFormatToBoard(firestone);
    expect(back.minions).toHaveLength(0);
  });
});
