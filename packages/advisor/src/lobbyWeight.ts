import type { OpponentState } from '@overlay/shared';

/**
 * Compute per-opponent lobby weights for simulation scoring.
 * Weight = opponent.hp / totalAliveHp. Eliminated opponents get 0.
 */
export function lobbyWeights(opponents: OpponentState[]): number[] {
  const totalAliveHp = opponents.reduce((sum, opp) => sum + (opp.eliminated ? 0 : opp.hero.hp), 0);

  return opponents.map((opp) => {
    if (opp.eliminated || totalAliveHp === 0) return 0;
    return opp.hero.hp / totalAliveHp;
  });
}

/**
 * Sum all per-opponent lobby weights.
 * Returns 0 for empty input.
 */
export function totalLobbyWeight(opponents: OpponentState[]): number {
  return lobbyWeights(opponents).reduce((sum, w) => sum + w, 0);
}
