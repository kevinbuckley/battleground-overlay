interface TierTarget {
  idealTurn: number;
  minHp: number;
}

// From docs/heuristics/tier-curve.md
const TIER_TARGETS: Record<number, TierTarget> = {
  2: { idealTurn: 2, minHp: 0 },
  3: { idealTurn: 4, minHp: 30 },
  4: { idealTurn: 6, minHp: 25 },
  5: { idealTurn: 8, minHp: 20 },
  6: { idealTurn: 10, minHp: 15 },
};

export function tierCurveScore(turn: number, hp: number, gold: number, currentTier: number, tierUpCost: number): number {
  if (currentTier >= 6) return 0;
  if (gold < tierUpCost) return 0;

  const nextTier = currentTier + 1;
  const target = TIER_TARGETS[nextTier];
  if (!target) return 0;

  if (turn < target.idealTurn) return 0;

  let score = 0.8 + Math.min(0.2, (turn - target.idealTurn) * 0.1);
  if (hp < target.minHp) score *= 0.5;

  return Math.min(1.0, score);
}
