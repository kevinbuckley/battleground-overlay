import { resolve } from 'node:path';

import { pruneOldSessions } from '@overlay/shared';
import type { BrowserWindow } from 'electron';
import { defaultSettings, loadSettings } from './settings';

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
  settingsPath?: string,
  appOverride?: {
    whenReady: () => Promise<void>;
    globalShortcut: { register(key: string, cb: () => void): boolean; unregisterAll(): void };
  },
): BrowserWindow {
  const electron = require('electron') as typeof import('electron');
  const { app, BrowserWindow: RealBrowserWindow } = electron;

  pruneOldSessions(50);

  const settings = settingsPath ? loadSettings(settingsPath) : defaultSettings();

  // In tests, BrowserWindowCtor is a factory function (arrow fn can't use `new`).
  // In production, use the real constructor.
  const win: BrowserWindow =
    BrowserWindowCtor !== null
      ? (BrowserWindowCtor as unknown as () => BrowserWindow)()
      : new RealBrowserWindow(getWindowOptions());

  win.setOpacity(settings.opacity);
  win.setPosition(settings.x, settings.y);

  const { setOverlayWin } = require('./overlayState');
  const { anchorToHearthstone } = require('./anchor');
  const { defaultHotkeyConfig, registerHotkeys } = require('./hotkeys');

  setOverlayWin(win);
  win.setIgnoreMouseEvents(true);
  anchorToHearthstone(win, { x: 10, y: 10 });
  const cfg = defaultHotkeyConfig();
  registerHotkeys(win, cfg, appOverride ?? app);
  win.loadFile(getRendererPath());
  return win;
}
