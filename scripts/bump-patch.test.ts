import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SCRIPT_PATH = join(__dirname, '..', 'scripts', 'bump-patch.ts');
const CARD_DATA_DIR = join(__dirname, '..', 'packages', 'card-data');
const PATCH_FILE = join(CARD_DATA_DIR, 'PATCH.txt');
const CARDS_FILE = join(CARD_DATA_DIR, 'cards.json');

function readPatch(): string {
  return readFileSync(PATCH_FILE, 'utf-8').trim();
}

function restoreState(patch: string, cards: string): void {
  writeFileSync(PATCH_FILE, patch + '\n', 'utf-8');
  if (existsSync(CARDS_FILE)) {
    writeFileSync(CARDS_FILE, cards, 'utf-8');
  }
}

describe('bump-patch.ts', () => {
  it('exits with error when no patch argument provided', async () => {
    const result = await Bun.spawn(['bun', SCRIPT_PATH], {
      cwd: __dirname,
    });
    const exitCode = await result.exited;
    expect(exitCode).toBe(1);
  });

  it('exits with error when fetch fails (no network)', async () => {
    const originalPatch = readPatch();
    const originalCards = existsSync(CARDS_FILE) ? readFileSync(CARDS_FILE, 'utf-8') : null;

    try {
      const result = await Bun.spawn(['bun', SCRIPT_PATH, '99.9.9'], { cwd: __dirname });
      const exitCode = await result.exited;
      expect(exitCode).toBe(1);
    } finally {
      restoreState(originalPatch, originalCards ?? '');
    }
  });
});
