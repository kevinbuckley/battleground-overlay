import type { HsEvent } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';
import { initialState } from './initialState';
import { reducer } from './reducer';

export interface Pipeline {
  onEvent: (event: HsEvent) => void;
  getState: () => GameState;
  reset: () => void;
}

export function createPipeline(): Pipeline {
  let state: GameState = initialState();

  return {
    onEvent(event: HsEvent) {
      state = reducer(state, event);
    },
    getState() {
      return state;
    },
    reset() {
      state = initialState();
    },
  };
}
