import { describe, expect, it } from 'bun:test';
import type { HsEvent } from '@overlay/log-parser';
import type { BrowserWindow } from 'electron';
import { bootstrapOverlay } from './bootstrap';
import type { BootstrapDeps } from './bootstrap';

function makeMockWin() {
  const sends: { channel: string; args: unknown[] }[] = [];
  return {
    webContents: {
      send: (channel: string, ...args: unknown[]) => {
        sends.push({ channel, args });
      },
    },
    _getSends: () => sends,
  };
}

const nullDeps: BootstrapDeps = {
  runDoctor: async () => ({ hsRunning: false, configOk: false, mlxOk: false, missingSections: [] }),
  anchorFn: async () => false,
  wireFn: async () => null,
  logFn: () => {},
};

describe('bootstrapOverlay', () => {
  it('returns an object with coordinator and streamHandle keys', async () => {
    const mockWin = makeMockWin();
    const result = await bootstrapOverlay(mockWin as unknown as BrowserWindow, nullDeps);

    expect(result).toHaveProperty('coordinator');
    expect(result).toHaveProperty('streamHandle');
    expect(typeof result.coordinator.onEvent).toBe('function');
    expect(typeof result.coordinator.getState).toBe('function');
    expect(typeof result.coordinator.stop).toBe('function');

    result.coordinator.stop();
  });

  it('wireFn is invoked exactly once with an onEvent function', async () => {
    const mockWin = makeMockWin();
    let wireCalled = false;
    let wireArgType = '';

    const result = await bootstrapOverlay(mockWin as unknown as BrowserWindow, {
      ...nullDeps,
      wireFn: (onEvent: (e: HsEvent) => void) => {
        wireCalled = true;
        wireArgType = typeof onEvent;
        return Promise.resolve(null);
      },
    });

    expect(wireCalled).toBe(true);
    expect(wireArgType).toBe('function');
    expect(result.streamHandle).toBeNull();

    result.coordinator.stop();
  });

  it('when wireFn returns null, streamHandle is null and coordinator still present', async () => {
    const mockWin = makeMockWin();

    const result = await bootstrapOverlay(mockWin as unknown as BrowserWindow, {
      ...nullDeps,
      wireFn: () => Promise.resolve(null),
    });

    expect(result.streamHandle).toBeNull();
    expect(result.coordinator).not.toBeNull();
    expect(typeof result.coordinator.stop).toBe('function');

    result.coordinator.stop();
  });

  it('runDoctor is called and result is logged', async () => {
    const mockWin = makeMockWin();
    let doctorCalled = false;
    const loggedEntries: { kind: string; payload: unknown }[] = [];

    await bootstrapOverlay(mockWin as unknown as BrowserWindow, {
      ...nullDeps,
      runDoctor: async () => {
        doctorCalled = true;
        return { hsRunning: true, configOk: true, mlxOk: true, missingSections: [] };
      },
      logFn: (kind, payload) => loggedEntries.push({ kind, payload }),
    });

    expect(doctorCalled).toBe(true);
    expect(loggedEntries.some((e) => e.kind === 'doctor')).toBe(true);
  });

  it('startup banner is sent to renderer after doctor runs — all-true produces HS:✓', async () => {
    const mockWin = makeMockWin();

    await bootstrapOverlay(mockWin as unknown as BrowserWindow, {
      ...nullDeps,
      runDoctor: async () => ({ hsRunning: true, configOk: true, mlxOk: true, missingSections: [] }),
    });

    const bannerSend = mockWin._getSends().find((s) => s.channel === 'overlay:startup-banner');
    expect(bannerSend).toBeDefined();
    expect(bannerSend?.args[0]).toContain('HS:✓');
  });

  it('startup banner contains HS:✗ when HS not running', async () => {
    const mockWin = makeMockWin();

    await bootstrapOverlay(mockWin as unknown as BrowserWindow, {
      ...nullDeps,
      runDoctor: async () => ({ hsRunning: false, configOk: true, mlxOk: true, missingSections: [] }),
    });

    const bannerSend = mockWin._getSends().find((s) => s.channel === 'overlay:startup-banner');
    expect(bannerSend?.args[0]).toContain('HS:✗');
  });

  it('anchorFn success sets coordinator hsStatus to anchored', async () => {
    const mockWin = makeMockWin();

    const result = await bootstrapOverlay(mockWin as unknown as BrowserWindow, {
      ...nullDeps,
      anchorFn: async () => true,
    });

    expect(result.coordinator.getHsStatus()).toBe('anchored');
    result.coordinator.stop();
  });

  it('anchorFn failure sets coordinator hsStatus to failed', async () => {
    const mockWin = makeMockWin();

    const result = await bootstrapOverlay(mockWin as unknown as BrowserWindow, {
      ...nullDeps,
      anchorFn: async () => false,
    });

    expect(result.coordinator.getHsStatus()).toBe('failed');
    result.coordinator.stop();
  });
});
