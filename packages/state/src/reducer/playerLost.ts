import type { GameState } from '@overlay/shared';
import type { TagChange } from '@overlay/log-parser';

export function applyPlayerLost(state: GameState, event: TagChange): GameState {
  const entityId = parseInt(event.entity, 10);
  if (isNaN(entityId)) return state;

  const opponentIdx = state.opponents.findIndex((o) => o.entityId === entityId);
  if (opponentIdx === -1) return state;

  const opponents = state.opponents.map((o, i) =>
    i === opponentIdx ? { ...o, eliminated: true } : o,
  );
  return { ...state, opponents };
}
