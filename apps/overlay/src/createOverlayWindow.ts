import { resolve } from 'node:path';

import { pruneOldSessions } from '@overlay/shared';
import type { BrowserWindow } from 'electron';

export function getRendererPath(): string {
  return resolve(__dirname, 'renderer.html');
}

export function getWindowOptions(): Record<string, unknown> {
  return {
    width: 800,
    height: 200,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  };
}

export function createOverlayWindow(
  BrowserWindowCtor: typeof BrowserWindow = null as unknown as typeof BrowserWindow,
): BrowserWindow {
  const electron = require('electron') as typeof import('electron');
  const { app, BrowserWindow: RealBrowserWindow } = electron;
  const Ctor = BrowserWindowCtor !== null ? BrowserWindowCtor : RealBrowserWindow;

  pruneOldSessions(50);

  const win = new Ctor(getWindowOptions());

  const { setOverlayWin } = require('./overlayState');
  const { anchorToHearthstone } = require('./anchor');
  const { defaultHotkeyConfig, registerHotkeys } = require('./hotkeys');

  setOverlayWin(win);
  win.setIgnoreMouseEvents(true);
  anchorToHearthstone(win, { x: 10, y: 10 });
  const cfg = defaultHotkeyConfig();
  registerHotkeys(win, cfg, app);
  win.loadFile(getRendererPath());
  return win;
}
