import type { TagChange } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';

const phaseMap: Record<string, GameState['phase']> = {
  MAIN_READY: 'shopping',
  BEGIN_SHOOTING_ATTACK: 'combat',
  MAIN_COMBAT: 'combat',
  MAIN_CLEANUP: 'end',
  FINAL_GAMEOVER: 'end',
};

export function applyTurnPhase(state: GameState, event: TagChange): GameState {
  if (event.tag !== 'STEP') return state;

  const newPhase = phaseMap[event.value];
  if (!newPhase) return state;

  // Don't touch state.turn here — STEP=MAIN_READY fires multiple times per BG
  // turn. The authoritative turn counter is GameEntity NUM_TURNS_IN_PLAY,
  // handled in the main reducer.
  return { ...state, phase: newPhase };
}
