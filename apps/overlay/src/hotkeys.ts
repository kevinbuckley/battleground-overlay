export type HotkeyConfig = {
  toggle: string;
  reload: string;
  hide: string;
};

export type AppInterface = {
  whenReady: () => Promise<void>;
  globalShortcut: {
    register(key: string, callback: () => void): boolean;
    unregisterAll(): void;
  };
  on(event: string, callback: () => void): void;
};

export type WindowInterface = {
  isVisible: () => boolean;
  setVisible(visible: boolean): void;
  hide(): void;
  webContents: { reload(): void };
};

export function defaultHotkeyConfig(): HotkeyConfig {
  return { toggle: 'Alt+B', reload: 'Alt+R', hide: 'Alt+H' };
}

export function registerHotkeys(win: WindowInterface, cfg: HotkeyConfig, app: AppInterface): void {
  app.globalShortcut.unregisterAll();

  app.whenReady().then(() => {
    app.globalShortcut.register(cfg.toggle, () => {
      const isVisible = win.isVisible();
      win.setVisible(!isVisible);
    });
    app.globalShortcut.register(cfg.reload, () => {
      win.webContents.reload();
    });
    app.globalShortcut.register(cfg.hide, () => {
      win.hide();
    });
  });

  app.on('will-quit', () => {
    app.globalShortcut.unregisterAll();
  });
}

export function unregisterAllHotkeys(app: AppInterface): void {
  app.globalShortcut.unregisterAll();
}
