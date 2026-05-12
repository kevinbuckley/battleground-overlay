import { describe, expect, it } from 'bun:test';
import type { BgsBoardInfo } from '@firestone-hs/simulate-bgs-battle/dist/bgs-board-info';
import { Benchmark, compareBenchmarks } from './bench';
import type { BenchResult } from './bench';

const board: BgsBoardInfo = {
  player: {
    cardId: 'TB_BaconShop_HERO_KelThuzad',
    hpLeft: 40,
    tavernTier: 1,
    heroPowers: [],
    questEntities: [],
  },
  board: [
    { entityId: 1, cardId: 'CS2_168', attack: 2, health: 1 },
    { entityId: 2, cardId: 'CS2_168', attack: 1, health: 2 },
  ],
};

const oppBoard: BgsBoardInfo = {
  player: {
    cardId: 'TB_BaconShop_HERO_Uther',
    hpLeft: 30,
    tavernTier: 2,
    heroPowers: [],
    questEntities: [],
  },
  board: [{ entityId: 3, cardId: 'CS2_168', attack: 3, health: 3 }],
};

describe('Benchmark', () => {
  it('addScenario registers a scenario and runAll returns a result', () => {
    const bench = new Benchmark();
    bench.addScenario('scenario1', board, [oppBoard], 10, 42);
    const results = bench.runAll();
    const r = results.scenario1 as unknown as BenchResult;
    expect(typeof r.sims).toBe('number');
    expect(typeof r.winPct).toBe('number');
    expect(typeof r.durationMs).toBe('number');
    expect(r.sims).toBeGreaterThanOrEqual(0);
  });

  it('runAll with no scenarios returns empty object', () => {
    const bench = new Benchmark();
    const results = bench.runAll();
    expect(Object.keys(results)).toHaveLength(0);
  });

  it('runAll with multiple scenarios returns all by name', () => {
    const bench = new Benchmark();
    bench.addScenario('a', board, [oppBoard], 5, 1);
    bench.addScenario('b', oppBoard, [board], 5, 2);
    const results = bench.runAll();
    expect(Object.keys(results)).toContain('a');
    expect(Object.keys(results)).toContain('b');
  });
});

describe('compareBenchmarks', () => {
  it('returns a string with header and scenario lines', () => {
    const old = { a: { durationMs: 100, winPct: 0.5, sims: 10 } };
    const new_ = { a: { durationMs: 120, winPct: 0.6, sims: 10 } };
    const result = compareBenchmarks(old, new_);
    expect(result).toContain('Benchmark Comparison');
    expect(result).toContain('a:');
  });

  it('reports new scenarios as + and removed as -', () => {
    const old = { a: { durationMs: 100, winPct: 0.5, sims: 10 } };
    const new_ = { b: { durationMs: 100, winPct: 0.7, sims: 10 } };
    const result = compareBenchmarks(old, new_);
    expect(result).toContain('+ b: NEW');
    expect(result).toContain('- a: REMOVED');
  });

  it('reports no change when winPct is identical', () => {
    const old = { a: { durationMs: 100, winPct: 0.5, sims: 10 } };
    const new_ = { a: { durationMs: 100, winPct: 0.5, sims: 10 } };
    const result = compareBenchmarks(old, new_);
    expect(result).toContain('no change');
  });
});
