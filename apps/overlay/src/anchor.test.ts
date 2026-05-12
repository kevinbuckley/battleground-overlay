import { describe, expect, it } from 'bun:test';
import { getHearthstoneBounds } from './anchor';

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
});
