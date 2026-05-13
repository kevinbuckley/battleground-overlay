import type { ScoreResult } from '@overlay/advisor';

export interface DamageForecast {
  minDmg: number;
  maxDmg: number;
  winPct: number;
}

/**
 * Compute a damage forecast from a simulation score result.
 *
 * `minDmg` is the expected damage dealt if the player loses all
 * encounters (worst case). `maxDmg` is the expected damage dealt if
 * the player wins all encounters (best case). `winPct` is carried
 * directly from the score result.
 *
 * The damage model: in each simulated battle the player deals
 * `playerTier` damage per loss and receives `opponentTier` damage
 * per win (from avgHpDelta). We derive min/max from the range of
 * possible outcomes.
 */
export function computeDamageForecast(
  scoreResult: ScoreResult,
  playerTier: number,
): DamageForecast {
  // avgHpDelta = (wins * oppTier - losses * playerTier) / totalSims
  // Worst case: player loses everything → minDmg = 0 (deals no damage to opponents)
  // Best case: player wins everything → maxDmg = totalSims * playerTier
  //
  // But we want damage the player RECEIVES, not deals.
  // minDmg: expected damage received in worst case (losing all sims)
  // maxDmg: expected damage received in best case (winning all sims)
  //
  // Actually: the forecast tells the player how much damage they'll
  // take. If they lose, they take opponent's board damage. If they
  // win, they deal their board damage.
  //
  // Simplified model:
  // - minDmg: when winPct is 0, expected damage received = 0 (no sims)
  //   when winPct > 0, scale by winPct
  // - maxDmg: when winPct is 1, player deals max damage (wins all)
  //
  // The most useful interpretation:
  // minDmg = expected damage the player will TAKE (from losing sims)
  // maxDmg = expected damage the player will DEAL (from winning sims)
  //
  // From avgHpDelta:
  //   avgHpDelta = (wins * oppTier - losses * playerTier) / totalSims
  //
  // Expected damage taken (losing): losses/totalSims * avgOpponentAttack
  // Expected damage dealt (winning): wins/totalSims * playerAttack
  //
  // Simplified: use tier as proxy for attack.
  // minDmg = (1 - winPct) * playerTier  (damage taken when losing)
  // maxDmg = winPct * playerTier        (damage dealt when winning)

  // Guard: when avgHpDelta is 0 and winPct is 0 (no sims run), return
  // all-zero forecast to avoid NaN or misleading values.
  if (scoreResult.avgHpDelta === 0 && scoreResult.winPct === 0) {
    return { minDmg: 0, maxDmg: 0, winPct: 0 };
  }

  const minDmg = Math.round((1 - scoreResult.winPct) * playerTier);
  const maxDmg = Math.round(scoreResult.winPct * playerTier);

  // Clamp minDmg to 0 when avgHpDelta < 0 (player winning in HP exchange).
  const clampedMinDmg = scoreResult.avgHpDelta < 0 ? 0 : Math.max(0, minDmg);

  return { minDmg: clampedMinDmg, maxDmg, winPct: scoreResult.winPct };
}
