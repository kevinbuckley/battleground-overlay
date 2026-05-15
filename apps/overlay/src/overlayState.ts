import type { GameState } from '@overlay/shared';
import type { BrowserWindow } from 'electron';
import type { OverlaySettings } from './settings';

let overlayWin: BrowserWindow | null = null;
let currentSettings: OverlaySettings | null = null;

export function setOverlayWin(win: BrowserWindow): void {
  overlayWin = win;
}

export function setInteractive(interactive: boolean): void {
  if (overlayWin) {
    overlayWin.setIgnoreMouseEvents(!interactive, { forward: true });
  }
}

export function getOverlayWin(): BrowserWindow | null {
  return overlayWin;
}

export function getGold(state: GameState): number {
  return state.player?.gold ?? 0;
}

export function getTier(state: GameState): number {
  return state.player?.tier ?? 0;
}

export function setCurrentSettings(s: OverlaySettings): void {
  currentSettings = s;
}

export function getCurrentSettings(): OverlaySettings | null {
  return currentSettings;
}
