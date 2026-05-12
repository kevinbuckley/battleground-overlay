import type { HsEvent } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';

export function applyAnomaly(state: GameState, event: HsEvent): GameState {
  if (event.kind !== 'TAG_CHANGE') return state;
  if (event.tag !== 'ANOMALY') return state;

  const entityId = Number.parseInt(event.entity, 10);
  if (Number.isNaN(entityId)) return state;
  if (entityId !== state.player.entityId) return state;

  const value = event.value;
  if (value === '0' || value === '0.0') {
    return { ...state, anomaly: null };
  }

  return { ...state, anomaly: value };
}
