import type { TagChange } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';

export function applyGameOver(state: GameState, event: TagChange): GameState {
  if (event.tag !== 'PLAYSTATE') return state;
  if (event.value !== 'FINISHED') return state;

  return { ...state, phase: 'end' };
}
