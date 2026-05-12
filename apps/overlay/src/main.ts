import { BrowserWindow, app, ipcMain } from 'electron';
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
  win.loadURL('about:blank');
}

ipcMain.handle('set-interactive', (_event, interactive: boolean) => {
  setInteractive(interactive);
  return true;
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
