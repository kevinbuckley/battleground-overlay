import { setBoardPanel, setOpponentPanel } from '@overlay/shared';
import { app, ipcMain } from 'electron';
import { setAdvice } from './advicePanel';
import { createOverlayWindow } from './createOverlayWindow';
import { setExplanation } from './explanationPanel';
import { wireLogStream } from './logStream';
import { getOverlayWin, setInteractive } from './overlayState';
import { loadSettings } from './settings';

async function createWindow(): Promise<void> {
  createOverlayWindow();
  await wireLogStream(() => {});
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

ipcMain.handle('settings:apply', (_event, path: string) => {
  const s = loadSettings(path);
  const win = getOverlayWin();
  if (win) {
    win.setOpacity(s.opacity);
    win.setPosition(s.x, s.y);
  }
  return true;
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
