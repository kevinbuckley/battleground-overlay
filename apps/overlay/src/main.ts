import { setBoardPanel, setOpponentPanel } from '@overlay/shared';
import { app, ipcMain } from 'electron';
import { setAdvice } from './advicePanel';
import { createOverlayWindow } from './createOverlayWindow';
import { setExplanation } from './explanationPanel';
import { registerIpcHandlers } from './ipcHandlers';
import { wireLogStream } from './logStream';
import { setInteractive } from './overlayState';
import { loadSettings } from './settings';

async function createWindow(): Promise<void> {
  createOverlayWindow();
  await wireLogStream(() => {});
}

registerIpcHandlers(ipcMain, {
  settings: { loadSettings },
  panels: {
    setAdvice,
    setExplanation,
    setBoardPanel,
    setOpponentPanel,
    setInteractive,
  },
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
