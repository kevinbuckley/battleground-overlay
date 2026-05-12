import { BrowserWindow, app, ipcMain } from 'electron';
import { setAdvice } from './advicePanel';
import { anchorToHearthstone } from './anchor';
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

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
