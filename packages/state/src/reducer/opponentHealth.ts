import type { TagChange } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';

export function applyOpponentHealth(state: GameState, event: TagChange): GameState {
  const entityId = Number.parseInt(event.entity, 10);
  if (isNaN(entityId)) return state;

  const oppIndex = state.opponents.findIndex((o) => o.entityId === entityId);
  if (oppIndex === -1) return state;

  const hp = Number.parseInt(event.value, 10);
  if (isNaN(hp)) return state;

  const nextOpponents = state.opponents.map((o, i) =>
    i === oppIndex ? { ...o, hero: { ...o.hero, hp } } : o,
  );

  return { ...state, opponents: nextOpponents };
}
