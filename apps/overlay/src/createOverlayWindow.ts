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
      preload: resolve(__dirname, 'preload.js'),
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
  const { app, BrowserWindow: RealBrowserWindow, globalShortcut } = electron;
  const appWithShortcut = Object.assign(Object.create(app ?? {}) as typeof app, {
    globalShortcut,
  });

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
  // Float above fullscreen apps and follow across Spaces (macOS).
  try {
    win.setAlwaysOnTop(true, 'screen-saver');
    win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  } catch {
    // ignore on platforms that don't support these
  }
  // Fixed location at top-right of screen so the overlay never lands somewhere
  // unexpected. Anchor still tracks HS but we explicitly resize+place.
  anchorToHearthstone(win, { x: 10, y: 10 });
  try {
    win.setBounds({ x: 20, y: 60, width: 380, height: 220 });
  } catch {
    /* ignore */
  }
  const cfg = defaultHotkeyConfig();
  registerHotkeys(win, cfg, appOverride ?? appWithShortcut);
  win.loadFile(getRendererPath());
  (win as BrowserWindow & { show?: () => void }).show?.();
  return win;
}
