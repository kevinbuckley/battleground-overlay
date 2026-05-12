import type { HsEvent } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';

export function applyHandSize(state: GameState, event: HsEvent): GameState {
  if (event.kind !== 'TAG_CHANGE') return state;
  if (event.tag !== 'NUM_CARDS_IN_HAND') return state;

  const entityId = Number.parseInt(event.entity, 10);
  if (Number.isNaN(entityId)) return state;
  if (entityId !== state.player.entityId) return state;

  const value = Number.parseInt(event.value, 10);
  if (Number.isNaN(value)) return state;

  return { ...state, player: { ...state.player, handSize: value } };
}
