import { describe, expect, it } from 'bun:test';
import { getOverlayWin, setInteractive } from './overlayState';

describe('overlayState', () => {
  it('getOverlayWin returns null when no window is set', () => {
    expect(getOverlayWin()).toBeNull();
  });

  it('setInteractive does not throw when no window is set', () => {
    expect(() => setInteractive(true)).not.toThrow();
    expect(() => setInteractive(false)).not.toThrow();
  });
});
