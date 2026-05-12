import { describe, expect, it } from 'bun:test';
import { patchVersion } from './patchVersion';

describe('patchVersion', () => {
  it('returns the current patch string from PATCH.txt', () => {
    expect(patchVersion()).toBe('30.4.3');
  });
});
