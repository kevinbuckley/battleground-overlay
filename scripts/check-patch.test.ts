import { describe, expect, it } from 'bun:test';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SCRIPT_PATH = join(__dirname, 'check-patch.ts');
const CARD_DATA_DIR = join(__dirname, '..', 'packages', 'card-data');
const PATCH_FILE = join(CARD_DATA_DIR, 'PATCH.txt');

function readPatch(): string {
  return readFileSync(PATCH_FILE, 'utf-8').trim();
}

function restorePatch(original: string): void {
  writeFileSync(PATCH_FILE, original + '\n', 'utf-8');
}

describe('check-patch.ts', () => {
  it('exits 0 when version matches', async () => {
    const original = readPatch();
    try {
      const result = await Bun.spawn(['bun', SCRIPT_PATH, original], {
        cwd: __dirname,
      });
      const exitCode = await result.exited;
      expect(exitCode).toBe(0);
    } finally {
      restorePatch(original);
    }
  });

  it('exits 1 when version does not match', async () => {
    const original = readPatch();
    try {
      const result = await Bun.spawn(['bun', SCRIPT_PATH, '99.9.9'], {
        cwd: __dirname,
      });
      const exitCode = await result.exited;
      expect(exitCode).toBe(1);
    } finally {
      restorePatch(original);
    }
  });

  it('exits 1 with usage message when no argument provided', async () => {
    const result = await Bun.spawn(['bun', SCRIPT_PATH], {
      cwd: __dirname,
    });
    const exitCode = await result.exited;
    expect(exitCode).toBe(1);
  });
});
