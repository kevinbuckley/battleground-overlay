import type { GameState } from '@overlay/shared';
import type { TagChange } from '@overlay/log-parser';

export function applyGold(state: GameState, event: TagChange): GameState {
  const entityId = parseInt(event.entity, 10);
  if (isNaN(entityId)) return state;
  if (entityId !== state.player.entityId) return state;

  const gold = parseInt(event.value, 10);
  if (isNaN(gold)) return state;

  return { ...state, player: { ...state.player, gold } };
}
