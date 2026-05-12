import type { Recommendation } from './recommendation';

export interface BoardPanelState {
  recommendation: Recommendation | null;
}

let _state: BoardPanelState = { recommendation: null };

export function setBoardPanel(state: BoardPanelState): void {
  _state = state;
}

export function getBoardPanel(): BoardPanelState {
  return _state;
}

export function clearBoardPanel(): void {
  _state = { recommendation: null };
}
