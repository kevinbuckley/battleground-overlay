import type { TagChange } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';

const TIER_UP_COSTS: Record<number, number> = {
  1: 6,
  2: 5,
  3: 4,
  4: 5,
  5: 6,
  6: 6,
  7: 6,
};

export function applyTierUp(state: GameState, event: TagChange): GameState {
  const entityId = Number.parseInt(event.entity, 10);
  if (isNaN(entityId)) return state;
  if (entityId !== state.player.entityId) return state;

  const newTier = Number.parseInt(event.value, 10);
  if (isNaN(newTier)) return state;
  if (newTier < 1 || newTier > 7) return state;

  const currentTier = state.player.tier;
  if (newTier <= currentTier) return state;

  return {
    ...state,
    player: {
      ...state.player,
      tier: newTier,
      tierUpCost: TIER_UP_COSTS[newTier] ?? 6,
    },
  };
}
