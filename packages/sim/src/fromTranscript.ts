import type { SimulationResult } from '@firestone-hs/simulate-bgs-battle/dist/simulation-result';

export interface Transcript {
  wins: number;
  losses: number;
  ties: number;
  winPct: number;
  lossPct: number;
  tiePct: number;
  avgDamageWon: number;
  avgDamageLost: number;
}

export function fromFirestoneTranscript(result: SimulationResult): Transcript {
  const total = result.won + result.lost + result.tied;
  return {
    wins: result.won,
    losses: result.lost,
    ties: result.tied,
    winPct: total > 0 ? result.won / total : 0,
    lossPct: total > 0 ? result.lost / total : 0,
    tiePct: total > 0 ? result.tied / total : 0,
    avgDamageWon: result.averageDamageWon,
    avgDamageLost: result.averageDamageLost,
  };
}
