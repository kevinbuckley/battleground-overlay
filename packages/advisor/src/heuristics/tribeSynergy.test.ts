import { describe, expect, it } from 'bun:test';
import type { Minion } from '@overlay/shared';
import { tribeSynergyScore } from './tribeSynergy';

function minion(tribes: string[]): Minion {
  return {
    entityId: 0,
    cardId: 'x',
    attack: 1,
    health: 1,
    taunt: false,
    divineShield: false,
    poisonous: false,
    reborn: false,
    frozen: false,
    golden: false,
    windfury: false,
    cleave: false,
    elite: false,
    lifesteal: false,
    cost: 0,
    tribes,
  };
}

describe('tribeSynergyScore', () => {
  it('returns 0 for tribe-less candidate', () => {
    expect(tribeSynergyScore([minion(['MURLOC'])], minion([]))).toBe(0);
  });

  it('returns 0 with no matching tribe members on board', () => {
    expect(tribeSynergyScore([minion(['BEAST'])], minion(['MURLOC']))).toBe(0);
  });

  it('scores proportional to matching board members', () => {
    const board = [minion(['MURLOC']), minion(['MURLOC']), minion(['BEAST'])];
    const score = tribeSynergyScore(board, minion(['MURLOC']));
    expect(score).toBeCloseTo(0.3); // 2 matches × 0.15
  });

  it('caps at 1.0', () => {
    const board = Array.from({ length: 10 }, () => minion(['MURLOC']));
    expect(tribeSynergyScore(board, minion(['MURLOC']))).toBe(1.0);
  });

  it('3 matching board minions returns ≥ 3 * 0.15 - 0.001', () => {
    const board = [minion(['MURLOC']), minion(['MURLOC']), minion(['MURLOC'])];
    const score = tribeSynergyScore(board, minion(['MURLOC']));
    expect(score).toBeGreaterThanOrEqual(3 * 0.15 - 0.001);
  });
});
