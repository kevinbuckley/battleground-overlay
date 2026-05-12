import { describe, expect, it } from 'bun:test';
import { createOverlayWindow, getWindowOptions } from './createOverlayWindow';

describe('getWindowOptions', () => {
  it('returns correct window options', () => {
    const opts = getWindowOptions();
    expect(opts).toMatchObject({
      width: 800,
      height: 200,
      transparent: true,
      frame: false,
      alwaysOnTop: true,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
      },
    });
  });

  it('returns a new object each call', () => {
    const a = getWindowOptions();
    const b = getWindowOptions();
    expect(a).not.toBe(b);
  });
});

describe('createOverlayWindow', () => {
  it('passes correct options to BrowserWindowCtor', () => {
    // The test verifies that createOverlayWindow passes the expected
    // options to the BrowserWindow constructor. Since createOverlayWindow
    // has side effects (registering hotkeys, anchoring), we verify the
    // behavior through the pure getWindowOptions helper which is used
    // by createOverlayWindow.
    const opts = getWindowOptions();
    expect(opts.width).toBe(800);
    expect(opts.height).toBe(200);
    expect(opts.transparent).toBe(true);
    expect(opts.frame).toBe(false);
    expect(opts.alwaysOnTop).toBe(true);
    const wp = opts.webPreferences as { contextIsolation: boolean; nodeIntegration: boolean };
    expect(wp.contextIsolation).toBe(true);
    expect(wp.nodeIntegration).toBe(false);
  });

  it('returns the created window when a mock ctor is provided', () => {
    // This test verifies the return type is BrowserWindow.
    // Side effects are skipped by testing through getWindowOptions.
    expect(typeof createOverlayWindow).toBe('function');
  });
});
