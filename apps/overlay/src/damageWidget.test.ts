import { describe, expect, it } from 'bun:test';
import type { ScoreResult } from '@overlay/advisor';
import { computeDamageForecast } from './damageWidget';

function makeScoreResult(winPct: number, avgHpDelta: number): ScoreResult {
  return { winPct, avgHpDelta };
}

describe('computeDamageForecast', () => {
  it('full-win: winPct=1 → minDmg=0, maxDmg=playerTier', () => {
    const result = computeDamageForecast(makeScoreResult(1, 5), 7);
    expect(result.winPct).toBe(1);
    expect(result.minDmg).toBe(0);
    expect(result.maxDmg).toBe(7);
  });

  it('full-loss: winPct=0, avgHpDelta<0 → minDmg=0 (player winning HP), maxDmg=0', () => {
    const result = computeDamageForecast(makeScoreResult(0, -3), 5);
    expect(result.winPct).toBe(0);
    expect(result.minDmg).toBe(0);
    expect(result.maxDmg).toBe(0);
  });

  it('50/50: winPct=0.5 → minDmg=floor(tier/2), maxDmg=ceil(tier/2)', () => {
    const result = computeDamageForecast(makeScoreResult(0.5, 0), 6);
    expect(result.winPct).toBe(0.5);
    expect(result.minDmg).toBe(3);
    expect(result.maxDmg).toBe(3);
  });

  it('zero scoreResult (avgHpDelta=0) returns all-zero forecast', () => {
    const result = computeDamageForecast(makeScoreResult(0, 0), 7);
    expect(result.minDmg).toBe(0);
    expect(result.maxDmg).toBe(0);
    expect(result.winPct).toBe(0);
  });

  it('negative avgHpDelta returns non-negative minDmg (clamped to 0)', () => {
    const result = computeDamageForecast(makeScoreResult(0, -3), 5);
    expect(result.minDmg).toBe(0);
    expect(result.maxDmg).toBe(0);
  });
});
