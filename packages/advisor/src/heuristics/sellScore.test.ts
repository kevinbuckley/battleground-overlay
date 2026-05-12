import { describe, expect, it } from 'bun:test';
import type { GameState, Minion } from '@overlay/shared';
import { initialState } from '@overlay/state';
import { sellScore } from './sellScore';

function makeMinion(
  entityId: number,
  cardId: string,
  attack: number,
  health: number,
  tribes: string[] = [],
): Minion {
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
    tribes,
  };
}

function makeState(): GameState {
  return initialState();
}

function first<T>(arr: T[]): T {
  const val = arr[0];
  if (val === undefined) throw new Error('empty array');
  return val;
}

describe('sellScore', () => {
  it('returns 0 for empty board', () => {
    const minion = makeMinion(1, 'CS2_168', 3, 3);
    expect(sellScore(minion, [], makeState())).toBe(0);
  });

  it('returns high score for weakest minion with no synergy', () => {
    const state = makeState();
    const board = [makeMinion(1, 'WEAK', 1, 1), makeMinion(2, 'STRONG', 5, 5)];
    const score = sellScore(first(board), board, state);
    // weakest (0.4) + no synergy (0.4) + not triple (0.2) = 1.0
    expect(score).toBe(1.0);
  });

  it('returns lower score for strongest minion', () => {
    const state = makeState();
    const board = [makeMinion(1, 'WEAK', 1, 1), makeMinion(2, 'STRONG', 5, 5)];
    const score = sellScore(board.at(1)!, board, state);
    // not weakest (0) + no synergy (0.4) + not triple (0.2) = 0.6
    expect(score).toBeCloseTo(0.6);
  });

  it('returns lower score when minion has tribe synergy', () => {
    const state = makeState();
    const board = [
      makeMinion(1, 'WEAK', 1, 1, ['Dragon']),
      makeMinion(2, 'STRONG', 5, 5, ['Dragon']),
    ];
    const score = sellScore(first(board), board, state);
    // weakest (0.4) + has synergy (0) + not triple (0.2) = 0.6
    expect(score).toBeCloseTo(0.6);
  });

  it('returns lower score when minion is triple-in-progress', () => {
    const state = makeState();
    const board = [
      makeMinion(1, 'TRIPLE', 1, 1),
      makeMinion(2, 'TRIPLE', 1, 1),
      makeMinion(3, 'TRIPLE', 1, 1),
    ];
    const score = sellScore(first(board), board, state);
    // weakest (0.4) + no synergy (0.4) + triple-in-progress (0) = 0.8
    expect(score).toBe(0.8);
  });

  it('returns 1.0 when weakest + no synergy + not triple (single minion)', () => {
    const state = makeState();
    const board = [makeMinion(1, 'SINGLE', 3, 3)];
    const score = sellScore(first(board), board, state);
    // weakest (0.4) + no synergy (0.4) + not triple (0.2) = 1.0
    expect(score).toBe(1.0);
  });
});
