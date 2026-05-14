import { describe, expect, it } from 'bun:test';
import { patchVersion } from './patchVersion';

describe('patchVersion', () => {
  it('returns the current patch string from PATCH.txt', () => {
    expect(patchVersion()).toBe('30.4.3');
  });

  it('returns a non-empty string', () => {
    const v = patchVersion();
    expect(typeof v).toBe('string');
    expect(v.length).toBeGreaterThan(0);
  });
});
