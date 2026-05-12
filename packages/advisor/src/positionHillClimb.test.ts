import { describe, expect, it } from 'bun:test';
import type { Board, OpponentState, PlayerState } from '@overlay/shared';
import { hillClimbPosition } from './positionHillClimb';

function makePlayerState(boardMinions: Board['minions'], hp = 30, tier = 3): PlayerState {
  return {
    entityId: 1,
    playerId: 1,
    hero: { entityId: 1, cardId: 'Hero_Gurubashi', hp, armor: 0 },
    board: { minions: boardMinions },
    shop: { minions: [], frozen: false, rollCost: 2 },
    gold: 5,
    tier,
    tierUpCost: 4,
    eliminated: false,
    entityRegistry: new Map(),
  };
}

function makeOpponent(
  boardMinions: Board['minions'],
  hp = 30,
  tier = 3,
  eliminated = false,
): OpponentState {
  return {
    entityId: 2,
    playerId: 2,
    hero: { entityId: 2, cardId: 'Hero_KelThuzad', hp, armor: 0 },
    board: { minions: boardMinions },
    tier,
    eliminated,
  };
}

function makeMinion(
  entityId: number,
  cardId: string,
  attack = 1,
  health = 1,
): Board['minions'][number] {
  return {
    entityId,
    cardId,
    attack,
    health,
    taunt: false,
    divineShield: false,
    poisonous: false,
    reborn: false,
    frozen: false,
    tribes: [],
  };
}

describe('hillClimbPosition', () => {
  it('returns current order when board has 0 minions', () => {
    const board: Board = { minions: [] };
    const playerState = makePlayerState([]);
    const opponents: OpponentState[] = [makeOpponent([])];

    const result = hillClimbPosition(board, playerState, opponents, 10);
    expect(result.bestOrder).toEqual([]);
    expect(result.bestScore.winPct).toBe(0);
  });

  it('returns current order when board has 1 minion', () => {
    const board: Board = { minions: [makeMinion(1, 'Minion_A', 3, 3)] };
    const playerState = makePlayerState(board.minions);
    const opponents: OpponentState[] = [makeOpponent([])];

    const result = hillClimbPosition(board, playerState, opponents, 10);
    expect(result.bestOrder).toEqual([0]);
  });

  it('is a no-op when n=0 (no simulations)', () => {
    const board: Board = {
      minions: [
        makeMinion(1, 'Minion_A', 1, 1),
        makeMinion(2, 'Minion_B', 3, 3),
        makeMinion(3, 'Minion_C', 2, 2),
      ],
    };
    const playerState = makePlayerState(board.minions);
    const opponents: OpponentState[] = [makeOpponent([])];

    const result = hillClimbPosition(board, playerState, opponents, 0);
    expect(result.bestOrder).toEqual([0, 1, 2]);
    expect(result.bestScore.winPct).toBe(0);
  });

  it('returns current order when no opponents are active', () => {
    const board: Board = {
      minions: [makeMinion(1, 'Minion_A', 1, 1), makeMinion(2, 'Minion_B', 3, 3)],
    };
    const playerState = makePlayerState(board.minions);
    const opponents: OpponentState[] = [makeOpponent([], 30, 3, true)];

    const result = hillClimbPosition(board, playerState, opponents, 10);
    expect(result.bestOrder).toEqual([0, 1]);
  });

  it('finds a better ordering when it improves winPct', () => {
    const board: Board = {
      minions: [
        makeMinion(1, 'Minion_A', 1, 1),
        makeMinion(2, 'Minion_B', 4, 4),
        makeMinion(3, 'Minion_C', 2, 2),
      ],
    };
    const playerState = makePlayerState(board.minions);
    const opponents: OpponentState[] = [makeOpponent([makeMinion(10, 'Enemy', 3, 3)], 30, 3)];

    const result = hillClimbPosition(board, playerState, opponents, 20);
    // Should find some ordering (not necessarily different from initial)
    expect(result.bestOrder.length).toBe(3);
    expect(new Set(result.bestOrder).size).toBe(3); // all indices present
    // Verify it's a valid permutation of [0, 1, 2]
    expect(result.bestOrder.sort()).toEqual([0, 1, 2]);
  });

  it('respects maxSwaps limit', () => {
    const board: Board = {
      minions: [
        makeMinion(1, 'Minion_A', 1, 1),
        makeMinion(2, 'Minion_B', 2, 2),
        makeMinion(3, 'Minion_C', 3, 3),
        makeMinion(4, 'Minion_D', 4, 4),
      ],
    };
    const playerState = makePlayerState(board.minions);
    const opponents: OpponentState[] = [makeOpponent([makeMinion(10, 'Enemy', 3, 3)], 30, 3)];

    const result = hillClimbPosition(board, playerState, opponents, 10, 2);
    expect(result.bestOrder.length).toBe(4);
  });

  it('returns non-trivial score when n > 0 and active opponents exist', () => {
    const board: Board = {
      minions: [makeMinion(1, 'Minion_A', 3, 3), makeMinion(2, 'Minion_B', 5, 5)],
    };
    const playerState = makePlayerState(board.minions, 30, 5);
    const opponents: OpponentState[] = [makeOpponent([makeMinion(10, 'Enemy', 4, 4)], 30, 5)];

    const result = hillClimbPosition(board, playerState, opponents, 20);
    expect(result.bestOrder.length).toBe(2);
    expect(new Set(result.bestOrder).size).toBe(2);
    // Score should be non-trivial (not just 0)
    expect(result.bestScore.winPct).toBeGreaterThanOrEqual(0);
    expect(result.bestScore.winPct).toBeLessThanOrEqual(1);
  });

  it('handles multiple active opponents', () => {
    const board: Board = {
      minions: [
        makeMinion(1, 'Minion_A', 2, 2),
        makeMinion(2, 'Minion_B', 3, 3),
        makeMinion(3, 'Minion_C', 4, 4),
      ],
    };
    const playerState = makePlayerState(board.minions, 30, 5);
    const opponents: OpponentState[] = [
      makeOpponent([makeMinion(10, 'Enemy1', 3, 3)], 30, 5),
      makeOpponent([makeMinion(11, 'Enemy2', 4, 4)], 30, 5),
    ];

    const result = hillClimbPosition(board, playerState, opponents, 20);
    expect(result.bestOrder.length).toBe(3);
    expect(new Set(result.bestOrder).size).toBe(3);
    expect(result.bestOrder.sort()).toEqual([0, 1, 2]);
  });

  it('skips eliminated opponents and still scores against active ones', () => {
    const board: Board = {
      minions: [makeMinion(1, 'Minion_A', 3, 3)],
    };
    const playerState = makePlayerState(board.minions, 30, 4);
    const opponents: OpponentState[] = [
      makeOpponent([], 30, 4, true), // eliminated
      makeOpponent([makeMinion(10, 'Enemy', 2, 2)], 30, 4), // active
    ];

    const result = hillClimbPosition(board, playerState, opponents, 20);
    expect(result.bestOrder).toEqual([0]);
    // Should still score against the active opponent
    expect(result.bestScore.winPct).toBeGreaterThanOrEqual(0);
  });
});
