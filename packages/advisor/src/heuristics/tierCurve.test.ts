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

  it('turn 2 low-gold returns < 0.5', () => {
    expect(tierCurveScore(2, 30, 1, 1, 3)).toBe(0);
  });

  it('turn 5 full-gold healthy returns > 0.5', () => {
    expect(tierCurveScore(6, 30, 10, 3, 3)).toBeGreaterThanOrEqual(0.8);
  });

  it('turn 10 desperate-hp forces low score', () => {
    const score = tierCurveScore(10, 5, 10, 5, 5);
    expect(score).toBeLessThan(0.5);
  });

  it('turn=0/hp=40/gold=0/tier=1 returns finite score in [0,1]', () => {
    const score = tierCurveScore(0, 40, 0, 1, 3);
    expect(Number.isFinite(score)).toBe(true);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it('turn=20/hp=1/gold=10/tier=6 returns finite score in [0,1]', () => {
    const score = tierCurveScore(20, 1, 10, 6, 0);
    expect(Number.isFinite(score)).toBe(true);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it('turn=10/hp=20/gold=5/tier=3 returns finite score in [0,1]', () => {
    const score = tierCurveScore(10, 20, 5, 3, 4);
    expect(Number.isFinite(score)).toBe(true);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });
});
