import type { TagChange } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';

export function applyOpponentTurnsInGame(state: GameState, event: TagChange): GameState {
  if (event.kind !== 'TAG_CHANGE') return state;
  if (event.tag !== 'NUM_TURNS_IN_GAME') return state;

  const entityId = Number.parseInt(event.entity, 10);
  if (Number.isNaN(entityId)) return state;

  const oppIndex = state.opponents.findIndex((o) => o.entityId === entityId);
  if (oppIndex === -1) return state;

  const value = Number.parseInt(event.value, 10);
  if (Number.isNaN(value)) return state;

  const nextOpponents = state.opponents.map((o, i) =>
    i === oppIndex ? { ...o, turnsInGame: value } : o,
  );

  return { ...state, opponents: nextOpponents };
}
