import { describe, expect, it } from 'bun:test';
import type { HsEvent } from '@overlay/log-parser';
import type { BrowserWindow } from 'electron';
import { bootstrapOverlay } from './bootstrap';

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

describe('bootstrapOverlay', () => {
  it('returns an object with coordinator and streamHandle keys', async () => {
    const mockWin = makeMockWin();
    const result = await bootstrapOverlay(mockWin as unknown as BrowserWindow);

    expect(result).toHaveProperty('coordinator');
    expect(result).toHaveProperty('streamHandle');
    expect(typeof result.coordinator.onEvent).toBe('function');
    expect(typeof result.coordinator.getState).toBe('function');
    expect(typeof result.coordinator.stop).toBe('function');

    result.coordinator.stop();
  });

  it('streamFactory is invoked exactly once with a function argument', async () => {
    const mockWin = makeMockWin();
    let factoryCalled = false;
    let factoryArgType = '';

    const streamFactory = (onEvent: (e: HsEvent) => void) => {
      factoryCalled = true;
      factoryArgType = typeof onEvent;
      return Promise.resolve(null);
    };

    const result = await bootstrapOverlay(mockWin as unknown as BrowserWindow, { streamFactory });

    expect(factoryCalled).toBe(true);
    expect(factoryArgType).toBe('function');
    expect(result.streamHandle).toBeNull();

    result.coordinator.stop();
  });

  it('when streamFactory returns null, streamHandle is null and coordinator still present', async () => {
    const mockWin = makeMockWin();

    const streamFactory = () => Promise.resolve(null);

    const result = await bootstrapOverlay(mockWin as unknown as BrowserWindow, { streamFactory });

    expect(result.streamHandle).toBeNull();
    expect(result.coordinator).not.toBeNull();
    expect(typeof result.coordinator.stop).toBe('function');

    result.coordinator.stop();
  });
});
