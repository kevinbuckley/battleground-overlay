import { describe, expect, it } from 'bun:test';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { findActiveLogDir, findHsLogDirCandidates } from './findActiveLogDir';

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

  it('filters non-Hearthstone dirs', () => {
    const base = mkdtempSync(join(tmpdir(), 'hs-logs-filter-'));
    mkdirSync(join(base, 'Hearthstone_A'));
    mkdirSync(join(base, 'OtherApp_B'));
    mkdirSync(join(base, 'Hearthstone_B'));

    const result = findActiveLogDir(base);
    expect(result).toBe(join(base, 'Hearthstone_B'));

    rmSync(base, { recursive: true });
  });

  it('throws if no matching directories exist', () => {
    const base = mkdtempSync(join(tmpdir(), 'hs-logs-empty-'));
    expect(() => findActiveLogDir(base)).toThrow();
    rmSync(base, { recursive: true });
  });

  describe('findHsLogDirCandidates', () => {
    it('returns [] for an empty directory', () => {
      const base = mkdtempSync(join(tmpdir(), 'hs-candidates-empty-'));
      const result = findHsLogDirCandidates(base);
      expect(result).toEqual([]);
      rmSync(base, { recursive: true });
    });

    it('returns only Hearthstone_* subdirectory names', () => {
      const base = mkdtempSync(join(tmpdir(), 'hs-candidates-filter-'));
      mkdirSync(join(base, 'Hearthstone_A'));
      mkdirSync(join(base, 'OtherApp_B'));
      mkdirSync(join(base, 'Hearthstone_B'));

      const result = findHsLogDirCandidates(base);
      expect(result).toContain('Hearthstone_A');
      expect(result).toContain('Hearthstone_B');
      expect(result).not.toContain('OtherApp_B');
      expect(result).toHaveLength(2);

      rmSync(base, { recursive: true });
    });

    it('returns [] for a nonexistent directory', () => {
      const result = findHsLogDirCandidates('/tmp/definitely-not-a-real-dir-xyz123');
      expect(result).toEqual([]);
    });
  });
});
