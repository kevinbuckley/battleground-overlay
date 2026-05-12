import { app, BrowserWindow } from 'electron';

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

  win.setIgnoreMouseEvents(true, { forward: true });
  win.loadURL('about:blank');
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
