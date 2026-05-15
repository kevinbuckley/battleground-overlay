import type { TagChange } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';

/**
 * Handles `TAG_CHANGE tag=NUM_REVIVES` on opponent controllers.
 * Updates `state.opponents[i].revives` for the matching opponent.
 */
export function applyOpponentRevives(state: GameState, event: TagChange): GameState {
  if (event.tag !== 'NUM_REVIVES') return state;

  const entityId = Number.parseInt(event.entity, 10);
  if (Number.isNaN(entityId)) return state;

  const oppIndex = state.opponents.findIndex((o) => o.entityId === entityId);
  if (oppIndex === -1) return state;

  const value = Number.parseInt(event.value, 10);
  if (Number.isNaN(value)) return state;

  const nextOpponents = state.opponents.map((o, i) =>
    i === oppIndex ? { ...o, revives: value } : o,
  );

  return { ...state, opponents: nextOpponents };
}
