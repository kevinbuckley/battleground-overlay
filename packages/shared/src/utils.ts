export function clamp(n: number, lo: number, hi: number): number {
  return n < lo ? lo : n > hi ? hi : n;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

import type { GameState } from './state';

export function isShoppingPhase(state: GameState): boolean {
  return state.phase === 'shopping';
}
