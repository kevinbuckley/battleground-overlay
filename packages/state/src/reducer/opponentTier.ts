import type { TagChange } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';

export function applyOpponentTier(state: GameState, event: TagChange): GameState {
  const entityId = Number.parseInt(event.entity, 10);
  if (isNaN(entityId)) return state;

  const oppIndex = state.opponents.findIndex((o) => o.entityId === entityId);
  if (oppIndex === -1) return state;

  const tier = Number.parseInt(event.value, 10);
  if (isNaN(tier)) return state;

  const nextOpponents = state.opponents.map((o, i) => (i === oppIndex ? { ...o, tier } : o));

  return { ...state, opponents: nextOpponents };
}
