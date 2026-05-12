import { setBoardPanel, setOpponentPanel } from '@overlay/shared';
import { BrowserWindow, app } from 'electron';
import { setAdvice } from './advicePanel';
import { anchorToHearthstone } from './anchor';
import { setExplanation } from './explanationPanel';
import { defaultHotkeyConfig, registerHotkeys } from './hotkeys';
import { setInteractive, setOverlayWin } from './overlayState';

function createWindow(): void {
  const win = new BrowserWindow({
    width: 400,
    height: 600,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    hasShadow: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  setOverlayWin(win);
  win.setIgnoreMouseEvents(true);
  anchorToHearthstone(win, { x: 10, y: 10 });
  const cfg = defaultHotkeyConfig();
  registerHotkeys(win, cfg, app);
  win.loadURL('about:blank');
}

ipcMain.handle('set-interactive', (_event, interactive: boolean) => {
  setInteractive(interactive);
  return true;
});

ipcMain.handle('set-advice', (_event, advice) => {
  setAdvice(advice);
  return true;
});

ipcMain.handle('set-explanation', (_event, explanation: string) => {
  setExplanation(explanation);
  return true;
});

ipcMain.handle('set-board-panel', (_event, panelState) => {
  setBoardPanel(panelState);
  return true;
});

ipcMain.handle('set-opponent-panel', (_event, panelState) => {
  setOpponentPanel(panelState);
  return true;
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
