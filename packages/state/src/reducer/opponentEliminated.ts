import type { TagChange } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';

export function applyOpponentEliminated(state: GameState, event: TagChange): GameState {
  const entityId = Number.parseInt(event.entity, 10);
  if (Number.isNaN(entityId)) return state;
  if (event.tag !== 'HEALTH') return state;
  if (event.value !== '0') return state;

  const oppIndex = state.opponents.findIndex((o) => o.entityId === entityId);
  if (oppIndex === -1) return state;

  const updated = state.opponents.map((o, i) => (i === oppIndex ? { ...o, eliminated: true } : o));

  return { ...state, opponents: updated };
}
