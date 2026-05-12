# Tier Curve Heuristic

Score in [0, 1] for "should I tier up now?" based on turn, HP, and current gold.

## Baseline tier-up turn targets (standard curve)

| Target Tier | Ideal Turn | Min HP to tier up |
|------------|-----------|------------------|
| 2          | 2         | any              |
| 3          | 4         | 30               |
| 4          | 6         | 25               |
| 5          | 8         | 20               |
| 6          | 10        | 15               |

## Scoring rules

- If you are at tier 6: score = 0 (already max)
- If current turn < ideal turn for next tier: score = 0 (too early)
- If current turn == ideal turn and HP >= min HP: score = 0.8
- If current turn > ideal turn: score += 0.1 per turn past ideal, capped at 1.0
- If HP < min HP: score *= 0.5 (bleeding out, safer to stabilize)
- If gold < tier-up cost: score = 0 (can't afford)
