import { describe, expect, it } from 'bun:test';
import type { Placeholder } from './index';

describe('shared', () => {
  it('Placeholder type compiles', () => {
    type _Check = Placeholder extends never ? true : false;
    expect(true).toBe(true);
  });
});
