import { describe, expect, it } from 'bun:test';
import { weightedWinScore } from './weightedScore';

describe('weightedWinScore', () => {
  it('returns 0 when all weights are zero', () => {
    const result = weightedWinScore({ winPct: 0.7, avgHpDelta: 0 }, [0, 0]);
    expect(result).toBe(0);
  });

  it('returns winPct * sum(weights) when all weights are equal', () => {
    const result = weightedWinScore({ winPct: 0.6, avgHpDelta: 0 }, [0.5, 0.5]);
    expect(result).toBeCloseTo(0.6);
  });

  it('returns average winPct when all weights are 1', () => {
    const result = weightedWinScore({ winPct: 0.8, avgHpDelta: 0 }, [1, 1, 1]);
    expect(result).toBeCloseTo(0.8 * 3);
  });

  it('returns 0 for zero winPct regardless of weights', () => {
    const result = weightedWinScore({ winPct: 0, avgHpDelta: 0 }, [0.3, 0.7]);
    expect(result).toBe(0);
  });

  it('returns 0 when weights array is empty', () => {
    const result = weightedWinScore({ winPct: 0.5, avgHpDelta: 0 }, []);
    expect(result).toBe(0);
  });

  it('scales linearly with winPct', () => {
    const r1 = weightedWinScore({ winPct: 0.2, avgHpDelta: 0 }, [0.5, 0.5]);
    const r2 = weightedWinScore({ winPct: 0.4, avgHpDelta: 0 }, [0.5, 0.5]);
    expect(r2).toBeCloseTo(r1 * 2);
  });

  it('scales linearly with weights', () => {
    const r1 = weightedWinScore({ winPct: 0.5, avgHpDelta: 0 }, [0.5, 0.5]);
    const r2 = weightedWinScore({ winPct: 0.5, avgHpDelta: 0 }, [1, 1]);
    expect(r2).toBeCloseTo(r1 * 2);
  });

  it('returns 0 when weights array is empty', () => {
    const result = weightedWinScore({ winPct: 0.5, avgHpDelta: 0 }, []);
    expect(result).toBe(0);
  });

  it('single weight returns winPct * that weight', () => {
    const result = weightedWinScore({ winPct: 0.7, avgHpDelta: 0 }, [0.3]);
    expect(result).toBeCloseTo(0.7 * 0.3);
  });

  it('weight array longer than opponents uses all weights (aggregated result)', () => {
    const result = weightedWinScore({ winPct: 0.5, avgHpDelta: 0 }, [0.1, 0.2, 0.3, 0.4]);
    expect(result).toBeCloseTo(0.5 * 1.0);
  });
});
