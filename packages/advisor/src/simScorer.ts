import type { Board, OpponentState, PlayerState } from '@overlay/shared';
import { simulateBatch, toFirestoneBoard } from '@overlay/sim';

export interface ScoreResult {
  winPct: number;
  avgHpDelta: number;
}

/**
 * Score a candidate against all opponents.
 *
 * For each opponent board, converts our projected board and the
 * opponent's board to Firestone format, runs `simulateBatch`,
 * then aggregates winPct across all opponents.
 *
 * Uses a deterministic seed derived from opponent attributes to
 * ensure reproducibility across calls.
 */
export function scoreCandidate(
  playerBoard: Board,
  playerState: PlayerState,
  opponents: OpponentState[],
  n: number,
): ScoreResult {
  const ourFirestoneBoard = toFirestoneBoard(playerBoard, playerState);

  let totalWins = 0;
  let totalSims = 0;

  for (const opp of opponents) {
    if (opp.eliminated) continue;

    const oppFirestoneBoard = toFirestoneBoard(opp.board, {
      hero: { ...opp.hero, armor: 0 },
      board: opp.board,
      gold: 0,
      tier: opp.tier,
      tierUpCost: 4,
      entityId: opp.entityId,
      playerId: opp.playerId,
      shop: { minions: [], frozen: false, rollCost: 2 },
      eliminated: false,
      entityRegistry: new Map(),
    });

    const result = simulateBatch(ourFirestoneBoard, oppFirestoneBoard, n, hashOpponent(opp));

    totalWins += result.wins;
    totalSims += result.wins + result.losses + result.ties;
  }

  if (totalSims === 0) {
    return { winPct: 0, avgHpDelta: 0 };
  }

  return {
    winPct: totalWins / totalSims,
    avgHpDelta: 0,
  };
}

function hashOpponent(opp: OpponentState): number {
  let hash = 0;
  const key = `${opp.entityId}-${opp.playerId}-${opp.tier}-${opp.hero.cardId}`;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) || 1;
}
