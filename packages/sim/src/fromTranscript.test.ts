import { describe, expect, it } from 'bun:test';
import { fromFirestoneTranscript } from './fromTranscript';
import type { SimulationResult } from '@firestone-hs/simulate-bgs-battle/dist/simulation-result';

const mockResult: SimulationResult = {
  wonLethal: 0,
  won: 60,
  tied: 10,
  lost: 30,
  lostLethal: 5,
  damageWon: 0,
  damageWons: [],
  damageWonRange: { min: 0, max: 0 },
  damageLost: 0,
  damageLosts: [],
  damageLostRange: { min: 0, max: 0 },
  wonLethalPercent: 0,
  wonPercent: 0.6,
  tiedPercent: 0.1,
  lostPercent: 0.3,
  lostLethalPercent: 0.05,
  averageDamageWon: 5,
  averageDamageLost: 3,
};

describe('fromFirestoneTranscript', () => {
  it('converts SimulationResult to Transcript', () => {
    const t = fromFirestoneTranscript(mockResult);
    expect(t.wins).toBe(60);
    expect(t.losses).toBe(30);
    expect(t.ties).toBe(10);
    expect(t.winPct).toBeCloseTo(0.6);
    expect(t.lossPct).toBeCloseTo(0.3);
    expect(t.avgDamageWon).toBe(5);
    expect(t.avgDamageLost).toBe(3);
  });

  it('handles zero-total gracefully', () => {
    const empty = { ...mockResult, won: 0, lost: 0, tied: 0 };
    const t = fromFirestoneTranscript(empty);
    expect(t.winPct).toBe(0);
    expect(t.lossPct).toBe(0);
  });
});
