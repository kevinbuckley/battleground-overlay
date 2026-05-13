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

export type HpBucket = 'critical' | 'low' | 'safe';

export function hpBucket(hp: number): HpBucket {
  return hp < 6 ? 'critical' : hp < 15 ? 'low' : 'safe';
}

export function minionsOnBoard(state: GameState): number {
  return state.player.board.minions.length;
}

export function opponentMinionsOnBoard(state: GameState, index: number): number {
  if (index < 0 || index >= state.opponents.length) return 0;
  return state.opponents[index].board.minions.length;
}

export function shopMinionCount(state: GameState): number {
  return state.player.shop.minions.length;
}
