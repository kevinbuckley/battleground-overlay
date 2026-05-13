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

export function getWorstThreat(opponents: OpponentState[]): OpponentState | null {
  const active = opponents.filter((o) => !o.eliminated);
  if (active.length === 0) return null;
  let worst: OpponentState | null = active[0] ?? null;
  for (let i = 1; i < active.length; i++) {
    const candidate = active[i];
    if (candidate && worst) {
      if (candidate.board.minions.length > worst.board.minions.length) {
        worst = candidate;
      }
    }
  }
  return worst;
}
