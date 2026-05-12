import type { TagChange } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';

const phaseMap: Record<string, GameState['phase']> = {
  MAIN_READY: 'shopping',
  BEGIN_SHOOTING_ATTACK: 'combat',
  MAIN_CLEANUP: 'end',
};

export function applyTurnPhase(state: GameState, event: TagChange): GameState {
  if (event.tag !== 'STEP') return state;

  const newPhase = phaseMap[event.value];
  if (!newPhase) return state;

  return { ...state, phase: newPhase };
}
