import { describe, expect, it } from 'bun:test';
import { mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { findActiveLogDir } from './findActiveLogDir';

describe('findActiveLogDir', () => {
  it('returns the lexicographically latest Hearthstone_ directory', () => {
    const base = mkdtempSync(join(tmpdir(), 'hs-logs-'));
    mkdirSync(join(base, 'Hearthstone_2024-01-01'));
    mkdirSync(join(base, 'Hearthstone_2024-03-15'));
    mkdirSync(join(base, 'Hearthstone_2024-02-10'));

    const result = findActiveLogDir(base);
    expect(result).toBe(join(base, 'Hearthstone_2024-03-15'));

    rmSync(base, { recursive: true });
  });

  it('throws if no matching directories exist', () => {
    const base = mkdtempSync(join(tmpdir(), 'hs-logs-empty-'));
    expect(() => findActiveLogDir(base)).toThrow();
    rmSync(base, { recursive: true });
  });
});
