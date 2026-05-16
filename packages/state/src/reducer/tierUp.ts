import type { TagChange } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';
import { entityRefersToPlayer } from '../entityId';

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
  // HS often reports PLAYER_TECH_LEVEL on the hero entity descriptor as well
  // as on the bare player entity — accept either.
  if (!entityRefersToPlayer(event.entity, state)) {
    // Try the hero descriptor: it carries player=N inside.
    const owner = (event.entityRaw ?? '').match(/\bplayer=(\d+)\b/);
    if (!owner || Number.parseInt(owner[1] ?? '', 10) !== state.player.playerId) return state;
  }

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
