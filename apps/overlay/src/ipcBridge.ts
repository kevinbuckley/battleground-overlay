import type { GameState, Recommendation } from '@overlay/shared';
import type { BrowserWindow } from 'electron';

let pollInterval: ReturnType<typeof setInterval> | null = null;

export function startBridge(
  win: BrowserWindow,
  getState: () => GameState,
  getRecs: () => Recommendation[] | null,
): void {
  pollInterval = setInterval(() => {
    try {
      const state = getState();
      win.webContents.send('overlay:state-update', state);
    } catch {
      // swallow — renderer may not be ready yet
    }
    try {
      const recs = getRecs?.();
      if (recs) {
        win.webContents.send('overlay:recs-update', recs);
      }
    } catch {
      // swallow — renderer may not be ready yet
    }
  }, 500);
}

export function stopBridge(): void {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}
