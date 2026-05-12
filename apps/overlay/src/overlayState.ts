import type { BrowserWindow } from 'electron';

let overlayWin: BrowserWindow | null = null;

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
