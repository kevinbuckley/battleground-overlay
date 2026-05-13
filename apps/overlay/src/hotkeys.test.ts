import { beforeEach, describe, expect, it } from 'bun:test';
import {
  type AppInterface,
  type HotkeyConfig,
  type WindowInterface,
  defaultHotkeyConfig,
  registerHotkeys,
  unregisterAllHotkeys,
} from './hotkeys';

describe('hotkeys', () => {
  let registered: { key: string; callback: () => void }[] = [];
  let appMock: AppInterface;
  let winMock: WindowInterface;

  beforeEach(() => {
    registered = [];
    appMock = {
      whenReady: () => Promise.resolve(),
      globalShortcut: {
        register: (key: string, callback: () => void) => {
          registered.push({ key, callback });
          return true;
        },
        unregisterAll: () => {
          registered = [];
        },
      },
      on: (() => {}) as unknown as AppInterface['on'],
    } as unknown as AppInterface;
    winMock = {
      isVisible: () => true,
      setVisible: (() => {}) as unknown as WindowInterface['setVisible'],
      hide: (() => {}) as unknown as WindowInterface['hide'],
      webContents: {
        reload: (() => {}) as unknown as WindowInterface['webContents']['reload'],
      },
    } as unknown as WindowInterface;
  });

  function findKey(k: string): { key: string; callback: () => void } {
    const entry = registered.find((r) => r.key === k);
    if (!entry) throw new Error(`key ${k} not found`);
    return entry;
  }

  it('defaultHotkeyConfig returns correct defaults', () => {
    const cfg = defaultHotkeyConfig();
    expect(cfg).toEqual({
      toggle: 'Alt+B',
      reload: 'Alt+R',
      hide: 'Alt+H',
    });
  });

  it('defaultHotkeyConfig returns a new object each call', () => {
    const a = defaultHotkeyConfig();
    const b = defaultHotkeyConfig();
    expect(a).not.toBe(b);
  });

  it('registerHotkeys registers all three shortcuts', async () => {
    const cfg: HotkeyConfig = {
      toggle: 'Cmd+Shift+T',
      reload: 'Cmd+Shift+R',
      hide: 'Cmd+Shift+H',
    };

    registerHotkeys(winMock, cfg, appMock);
    await Promise.resolve();

    expect(registered).toHaveLength(3);
    const keys = registered.map((r) => r.key);
    expect(keys).toContain('Cmd+Shift+T');
    expect(keys).toContain('Cmd+Shift+R');
    expect(keys).toContain('Cmd+Shift+H');
  });

  it('toggle callback toggles visibility', async () => {
    let visible = true;
    const toggledWin = {
      ...winMock,
      isVisible: () => visible,
      setVisible: (v: boolean) => {
        visible = v;
      },
    } as unknown as WindowInterface;

    const cfg = defaultHotkeyConfig();
    registerHotkeys(toggledWin, cfg, appMock);
    await Promise.resolve();

    const toggleCb = findKey('Alt+B').callback;
    visible = false;
    toggleCb();
    expect(visible).toBe(true);
    visible = true;
    toggleCb();
    expect(visible).toBe(false);
  });

  it('reload callback calls webContents.reload', async () => {
    let reloadCalled = false;
    const reloadWin = {
      ...winMock,
      webContents: {
        reload: () => {
          reloadCalled = true;
        },
      },
    } as unknown as WindowInterface;

    const cfg = defaultHotkeyConfig();
    registerHotkeys(reloadWin, cfg, appMock);
    await Promise.resolve();

    const reloadCb = findKey('Alt+R').callback;
    reloadCb();
    expect(reloadCalled).toBe(true);
  });

  it('hide callback calls win.hide', async () => {
    let hideCalled = false;
    const hideWin = {
      ...winMock,
      hide: () => {
        hideCalled = true;
      },
    } as unknown as WindowInterface;

    const cfg = defaultHotkeyConfig();
    registerHotkeys(hideWin, cfg, appMock);
    await Promise.resolve();

    const hideCb = findKey('Alt+H').callback;
    hideCb();
    expect(hideCalled).toBe(true);
  });

  it('unregisterAllHotkeys clears all registered shortcuts', async () => {
    const cfg = defaultHotkeyConfig();
    registerHotkeys(winMock, cfg, appMock);
    await Promise.resolve();
    expect(registered).toHaveLength(3);

    unregisterAllHotkeys(appMock);
    expect(registered).toHaveLength(0);
  });

  it('registerHotkeys registers will-quit handler', async () => {
    let onEvent = '';
    const onSpy = ((event: string, _callback: () => void) => {
      onEvent = event;
    }) as unknown as AppInterface['on'];

    const appWithOn = {
      ...appMock,
      on: onSpy,
    } as unknown as AppInterface;

    const cfg = defaultHotkeyConfig();
    registerHotkeys(winMock, cfg, appWithOn);
    await Promise.resolve();

    expect(onEvent).toBe('will-quit');
  });
});
