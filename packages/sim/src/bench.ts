import type { BgsBoardInfo } from '@firestone-hs/simulate-bgs-battle/dist/bgs-board-info';
import { simulateBatch } from './simulateBatch';

export interface BenchResult {
  durationMs: number;
  winPct: number;
  sims: number;
}

export interface BenchScenario {
  name: string;
  playerBoard: BgsBoardInfo;
  opponentBoards: BgsBoardInfo[];
  n: number;
  seed: number;
}

export class Benchmark {
  private scenarios: BenchScenario[] = [];

  addScenario(
    name: string,
    playerBoard: BgsBoardInfo,
    opponentBoards: BgsBoardInfo[],
    n: number,
    seed: number,
  ): void {
    this.scenarios.push({ name, playerBoard, opponentBoards, n, seed });
  }

  runAll(): Record<string, BenchResult> {
    const results: Record<string, BenchResult> = {};

    for (const scenario of this.scenarios) {
      const start = performance.now();

      let totalWins = 0;
      let totalLosses = 0;
      let totalTies = 0;

      for (const oppBoard of scenario.opponentBoards) {
        const batch = simulateBatch(scenario.playerBoard, oppBoard, scenario.n, scenario.seed);
        totalWins += batch.wins;
        totalLosses += batch.losses;
        totalTies += batch.ties;
      }

      const totalSims = totalWins + totalLosses + totalTies;
      const durationMs = performance.now() - start;
      const winPct = totalSims > 0 ? totalWins / totalSims : 0;

      results[scenario.name] = { durationMs, winPct, sims: totalSims };
    }

    return results;
  }
}

export function compareBenchmarks(
  old: Record<string, BenchResult>,
  newResults: Record<string, BenchResult>,
): string {
  const lines: string[] = [];
  lines.push('Benchmark Comparison');
  lines.push('='.repeat(50));

  const allNames = new Set([...Object.keys(old), ...Object.keys(newResults)]);

  for (const name of allNames) {
    const prev = old[name];
    const curr = newResults[name];

    if (!prev && curr) {
      lines.push(
        `+ ${name}: NEW (winPct: ${curr.winPct.toFixed(2)}, ${curr.sims} sims, ${curr.durationMs.toFixed(1)}ms)`,
      );
      continue;
    }
    if (prev && !curr) {
      lines.push(`- ${name}: REMOVED (was winPct: ${prev.winPct.toFixed(2)})`);
      continue;
    }
    if (!prev || !curr) {
      continue;
    }

    const delta = curr.winPct - prev.winPct;
    const status = delta > 0.01 ? '↑' : delta < -0.01 ? '↓' : '→';
    const diffStr = delta === 0 ? 'no change' : `${delta > 0 ? '+' : ''}${delta.toFixed(3)}`;
    const speedStr = `${curr.durationMs.toFixed(1)}ms (was ${prev.durationMs.toFixed(1)}ms)`;

    lines.push(
      `${status} ${name}: ${prev.winPct.toFixed(2)} → ${curr.winPct.toFixed(2)} (${diffStr}) | ${speedStr}`,
    );
  }

  return lines.join('\n');
}
