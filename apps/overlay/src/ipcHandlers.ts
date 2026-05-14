import type { setBoardPanel, setOpponentPanel } from '@overlay/shared';
import type { setAdvice } from './advicePanel';
import type { setExplanation } from './explanationPanel';
import { getOverlayWin, type setInteractive } from './overlayState';
import type { loadSettings } from './settings';

export function registerIpcHandlers(
  ipc: { handle(channel: string, cb: (...args: unknown[]) => unknown): void },
  deps: {
    settings: { loadSettings: typeof loadSettings };
    panels: {
      setAdvice: typeof setAdvice;
      setExplanation: typeof setExplanation;
      setBoardPanel: typeof setBoardPanel;
      setOpponentPanel: typeof setOpponentPanel;
      setInteractive: typeof setInteractive;
    };
  },
): void {
  const { loadSettings: loadSettingsFn } = deps.settings;
  const {
    setAdvice: setAdviceFn,
    setExplanation: setExplanationFn,
    setBoardPanel: setBoardPanelFn,
    setOpponentPanel: setOpponentPanelFn,
    setInteractive: setInteractiveFn,
  } = deps.panels;

  ipc.handle('set-interactive', (_event: unknown, ...args: unknown[]) => {
    setInteractiveFn(args[0] as boolean);
    return true;
  });

  ipc.handle('set-advice', (_event: unknown, ...args: unknown[]) => {
    setAdviceFn(args[0] as Parameters<typeof setAdviceFn>[0]);
    return true;
  });

  ipc.handle('set-explanation', (_event: unknown, ...args: unknown[]) => {
    setExplanationFn(args[0] as string);
    return true;
  });

  ipc.handle('set-board-panel', (_event: unknown, ...args: unknown[]) => {
    setBoardPanelFn(args[0] as Parameters<typeof setBoardPanelFn>[0]);
    return true;
  });

  ipc.handle('set-opponent-panel', (_event: unknown, ...args: unknown[]) => {
    setOpponentPanelFn(args[0] as Parameters<typeof setOpponentPanelFn>[0]);
    return true;
  });

  ipc.handle('settings:apply', (_event: unknown, ...args: unknown[]) => {
    const s = loadSettingsFn(args[0] as string);
    const win = getOverlayWin();
    if (win) {
      win.setOpacity(s.opacity);
      win.setPosition(s.x, s.y);
    }
    return true;
  });
}
