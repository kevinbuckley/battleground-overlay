import { describe, expect, it } from 'bun:test';
import { getHearthstoneBounds, isHearthstoneRunning } from './anchor';

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
});
