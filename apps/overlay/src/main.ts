import { setBoardPanel, setOpponentPanel } from '@overlay/shared';
import { app, ipcMain } from 'electron';
import { setAdvice } from './advicePanel';
import { createOverlayWindow } from './createOverlayWindow';
import { setExplanation } from './explanationPanel';
import { setInteractive } from './overlayState';

function createWindow(): void {
  createOverlayWindow();
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
