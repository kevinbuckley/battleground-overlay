import type { OpponentState } from './state';

export interface OpponentPanelState {
  opponents: OpponentState[];
}

let _state: OpponentPanelState = { opponents: [] };

export function setOpponentPanel(state: OpponentPanelState): void {
  _state = state;
}

export function getOpponentPanel(): OpponentPanelState {
  return _state;
}

export function clearOpponentPanel(): void {
  _state = { opponents: [] };
}
