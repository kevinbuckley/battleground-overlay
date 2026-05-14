import { describe, expect, it } from 'bun:test';
import {
  anchorToHearthstoneWithRetry,
  getAnchorStatus,
  getHearthstoneBounds,
  isHearthstoneRunning,
  setAnchorStatus,
} from './anchor';

describe('anchor', () => {
  it('getHearthstoneBounds returns null when Hearthstone is not running', () => {
    const result = getHearthstoneBounds();
    expect(result).toBeNull();
  });

  it('getHearthstoneBounds returns valid bounds when Hearthstone is running', () => {
    const result = getHearthstoneBounds();
    if (result) {
      expect(typeof result.x).toBe('number');
      expect(typeof result.y).toBe('number');
      expect(typeof result.width).toBe('number');
      expect(typeof result.height).toBe('number');
      expect(result.width).toBeGreaterThan(0);
      expect(result.height).toBeGreaterThan(0);
    }
  });

  it('getHearthstoneBounds called 3 times in a row does not throw', () => {
    expect(() => getHearthstoneBounds()).not.toThrow();
    expect(() => getHearthstoneBounds()).not.toThrow();
    expect(() => getHearthstoneBounds()).not.toThrow();
  });

  it('isHearthstoneRunning returns true when pgrep returns a PID', () => {
    const result = isHearthstoneRunning(() => '1234\n');
    expect(result).toBe(true);
  });

  it('isHearthstoneRunning returns false when pgrep returns empty string', () => {
    const result = isHearthstoneRunning(() => '');
    expect(result).toBe(false);
  });

  it('isHearthstoneRunning returns false when pgrep throws', () => {
    const result = isHearthstoneRunning(() => {
      throw new Error('not found');
    });
    expect(result).toBe(false);
  });

  it('anchorToHearthstoneWithRetry returns true if first attempt succeeds', async () => {
    const mockWin = {} as unknown as import('electron').BrowserWindow;
    const anchorFn = () => true;
    const result = await anchorToHearthstoneWithRetry(
      mockWin,
      { maxAttempts: 3, retryMs: 10 },
      anchorFn,
    );
    expect(result).toBe(true);
  });

  it('anchorToHearthstoneWithRetry returns false after maxAttempts=1 when attempt returns false', async () => {
    const mockWin = {} as unknown as import('electron').BrowserWindow;
    const anchorFn = () => false;
    const result = await anchorToHearthstoneWithRetry(
      mockWin,
      { maxAttempts: 1, retryMs: 10 },
      anchorFn,
    );
    expect(result).toBe(false);
  });

  it('anchorToHearthstoneWithRetry calls anchorFn exactly 3 times when maxAttempts=3 and all return false', async () => {
    const mockWin = {} as unknown as import('electron').BrowserWindow;
    let callCount = 0;
    const anchorFn = () => {
      callCount++;
      return false;
    };
    const result = await anchorToHearthstoneWithRetry(
      mockWin,
      { maxAttempts: 3, retryMs: 1 },
      anchorFn,
    );
    expect(result).toBe(false);
    expect(callCount).toBe(3);
  });

  it('getAnchorStatus returns initial value of waiting', () => {
    setAnchorStatus('waiting');
    expect(getAnchorStatus()).toBe('waiting');
  });

  it('getAnchorStatus returns anchored after setAnchorStatus', () => {
    setAnchorStatus('anchored');
    expect(getAnchorStatus()).toBe('anchored');
  });

  it('getAnchorStatus reflects toggle from failed back to anchored', () => {
    setAnchorStatus('failed');
    expect(getAnchorStatus()).toBe('failed');
    setAnchorStatus('anchored');
    expect(getAnchorStatus()).toBe('anchored');
  });
});
