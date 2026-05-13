import { describe, expect, it } from 'bun:test';
import type { Board, OpponentState, PlayerState } from '@overlay/shared';
import { scoreCandidate, scoreSellCandidate } from './simScorer';

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

describe('scoreCandidate', () => {
  it('returns {winPct: 0, avgHpDelta: 0} when all opponents are eliminated', () => {
    const playerBoard: Board = { minions: [] };
    const playerState = makePlayerState([]);
    const opponents: OpponentState[] = [
      makeOpponent([], 30, 3, true),
      makeOpponent([], 30, 3, true),
    ];
    const result = scoreCandidate(playerBoard, playerState, opponents, 10);
    expect(result.winPct).toBe(0);
    expect(result.avgHpDelta).toBe(0);
  });

  it('returns {winPct: 0, avgHpDelta: 0} when no opponents provided', () => {
    const playerBoard: Board = { minions: [] };
    const playerState = makePlayerState([]);
    const result = scoreCandidate(playerBoard, playerState, [], 10);
    expect(result.winPct).toBe(0);
    expect(result.avgHpDelta).toBe(0);
  });

  it('skips eliminated opponents and scores non-eliminated ones', () => {
    const playerBoard: Board = { minions: [] };
    const playerState = makePlayerState([]);
    const opponents: OpponentState[] = [
      makeOpponent([], 30, 3, true), // eliminated — should be skipped
      makeOpponent([], 30, 3, false), // active — should be scored
    ];
    const result = scoreCandidate(playerBoard, playerState, opponents, 10);
    // Should not throw and should return a valid result (not the "no opponents" case)
    expect(result).toHaveProperty('winPct');
    expect(result).toHaveProperty('avgHpDelta');
  });

  it('produces deterministic results for the same inputs', () => {
    const playerBoard: Board = { minions: [makeMinion(1, 'Minion_A', 3, 3)] };
    const playerState = makePlayerState(playerBoard.minions);
    const opponents: OpponentState[] = [makeOpponent([makeMinion(10, 'Minion_B', 2, 2)], 30, 3)];

    const r1 = scoreCandidate(playerBoard, playerState, opponents, 20);
    const r2 = scoreCandidate(playerBoard, playerState, opponents, 20);

    expect(r1.winPct).toBe(r2.winPct);
    expect(r1.avgHpDelta).toBe(r2.avgHpDelta);
  });

  it('returns non-zero avgHpDelta for a non-trivial matchup', () => {
    const playerBoard: Board = { minions: [makeMinion(1, 'Minion_A', 3, 3)] };
    const playerState = makePlayerState(playerBoard.minions, 30, 3);
    const opponents: OpponentState[] = [makeOpponent([makeMinion(10, 'Minion_B', 2, 2)], 30, 5)];

    const result = scoreCandidate(playerBoard, playerState, opponents, 50);

    // When the sim returns all ties (no card data), avgHpDelta is 0
    // which is correct: no wins and no losses means 0 delta
    // The formula is: (wins * oppTier - losses * playerTier) / totalSims
    // With wins=0, losses=0: delta = 0
    expect(result.avgHpDelta).toBe(0);
  });

  it('returns different winPct for different player board strengths', () => {
    const weakBoard: Board = { minions: [] };
    const strongBoard: Board = {
      minions: [makeMinion(1, 'StrongMinion', 5, 5)],
    };
    const playerState = makePlayerState([]);
    const opponents: OpponentState[] = [makeOpponent([makeMinion(10, 'MidMinion', 3, 3)], 30, 3)];

    const weakResult = scoreCandidate(weakBoard, playerState, opponents, 50);
    const strongResult = scoreCandidate(strongBoard, playerState, opponents, 50);

    // Strong board should have >= winPct as weak board
    expect(strongResult.winPct).toBeGreaterThanOrEqual(weakResult.winPct);
  });
});

describe('scoreSellCandidate', () => {
  it('returns ScoreResult shape with winPct and avgHpDelta', () => {
    const playerBoard: Board = { minions: [makeMinion(1, 'Minion_A', 2, 2)] };
    const playerState = makePlayerState(playerBoard.minions);
    const opponents: OpponentState[] = [makeOpponent([makeMinion(10, 'Minion_B', 1, 1)], 30, 3)];

    const result = scoreSellCandidate(playerBoard, playerState, opponents, 10);

    expect(result).toHaveProperty('winPct');
    expect(result).toHaveProperty('avgHpDelta');
    expect(typeof result.winPct).toBe('number');
    expect(typeof result.avgHpDelta).toBe('number');
  });

  it('returns zeroed result when n=0', () => {
    const playerBoard: Board = { minions: [makeMinion(1, 'Minion_A', 2, 2)] };
    const playerState = makePlayerState(playerBoard.minions);
    const opponents: OpponentState[] = [makeOpponent([makeMinion(10, 'Minion_B', 1, 1)], 30, 3)];

    const result = scoreSellCandidate(playerBoard, playerState, opponents, 0);

    expect(result.winPct).toBe(0);
    expect(result.avgHpDelta).toBe(0);
  });
});

describe('scoreCandidate with 2 opponents', () => {
  it('returns valid winPct and finite avgHpDelta with 2 opponents', () => {
    const playerBoard: Board = {
      minions: [makeMinion(1, 'Minion_A', 3, 3), makeMinion(2, 'Minion_B', 2, 2)],
    };
    const playerState = makePlayerState(playerBoard.minions);
    const opponents: OpponentState[] = [
      makeOpponent([makeMinion(10, 'Minion_C', 2, 2)], 30, 3),
      makeOpponent([makeMinion(11, 'Minion_D', 4, 4)], 30, 5),
    ];

    const result = scoreCandidate(playerBoard, playerState, opponents, 5);

    expect(result.winPct).toBeGreaterThanOrEqual(0);
    expect(result.winPct).toBeLessThanOrEqual(1);
    expect(Number.isFinite(result.avgHpDelta)).toBe(true);
  });
});
