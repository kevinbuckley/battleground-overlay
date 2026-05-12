import { describe, expect, it } from 'bun:test';
import { tierCurveScore } from './tierCurve';

describe('tierCurveScore', () => {
  it('returns 0 at max tier', () => {
    expect(tierCurveScore(10, 30, 10, 6, 0)).toBe(0);
  });

  it('returns 0 when gold < cost', () => {
    expect(tierCurveScore(4, 40, 2, 2, 5)).toBe(0);
  });

  it('returns 0 when too early to tier up', () => {
    expect(tierCurveScore(1, 40, 10, 1, 3)).toBe(0);
  });

  it('returns ~0.8 on ideal turn with enough hp', () => {
    const score = tierCurveScore(4, 35, 10, 2, 3);
    expect(score).toBeGreaterThanOrEqual(0.8);
  });

  it('penalizes low hp by halving score', () => {
    const highHp = tierCurveScore(4, 35, 10, 2, 3);
    const lowHp = tierCurveScore(4, 20, 10, 2, 3);
    expect(lowHp).toBeCloseTo(highHp * 0.5, 5);
  });

  it('score increases when past ideal turn', () => {
    const onTime = tierCurveScore(4, 35, 10, 2, 3);
    const late = tierCurveScore(6, 35, 10, 2, 3);
    expect(late).toBeGreaterThan(onTime);
  });
});
