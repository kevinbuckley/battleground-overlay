import type { TagChange } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';

export function applyOpponentMinionsOnBoard(state: GameState, event: TagChange): GameState {
  if (event.tag !== 'NUM_MINIONS_ON_BOARD') return state;

  const entityId = Number.parseInt(event.entity, 10);
  if (Number.isNaN(entityId)) return state;

  const oppIndex = state.opponents.findIndex((o) => o.entityId === entityId);
  if (oppIndex === -1) return state;

  const value = Number.parseInt(event.value, 10);
  if (Number.isNaN(value)) return state;

  const nextOpponents = state.opponents.map((o, i) =>
    i === oppIndex ? { ...o, minionsOnBoard: value } : o,
  );

  return { ...state, opponents: nextOpponents };
}
