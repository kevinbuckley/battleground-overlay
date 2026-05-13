import { beforeEach, describe, expect, it } from 'bun:test';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  appendSessionEvent,
  getCurrentSessionFile,
  listSessions,
  pruneOldSessions,
  readSession,
  resetSession,
} from './sessionLog';

const LOGS_DIR = join(import.meta.dirname, '..', '..', '..', 'logs');

beforeEach(() => {
  resetSession();
  if (existsSync(LOGS_DIR)) {
    for (const f of readdirSync(LOGS_DIR).filter((n) => n.startsWith('session-'))) {
      rmSync(join(LOGS_DIR, f));
    }
  }
});

describe('appendSessionEvent', () => {
  it('creates a JSONL file and writes one line per event', () => {
    appendSessionEvent('TEST_EVENT', { value: 42 });
    appendSessionEvent('TEST_EVENT', { value: 99 });

    const files = readdirSync(LOGS_DIR).filter((n) => n.startsWith('session-'));
    expect(files).toHaveLength(1);

    const lines = readFileSync(join(LOGS_DIR, files[0]!), 'utf8')
      .trim()
      .split('\n')
      .map((l) => JSON.parse(l));

    expect(lines).toHaveLength(2);
    expect(lines[0]).toMatchObject({ kind: 'TEST_EVENT', payload: { value: 42 } });
    expect(lines[1]).toMatchObject({ kind: 'TEST_EVENT', payload: { value: 99 } });
  });

  it('keeps events in the same file within one session', () => {
    appendSessionEvent('A', {});
    appendSessionEvent('B', {});

    const files = readdirSync(LOGS_DIR).filter((n) => n.startsWith('session-'));
    expect(files).toHaveLength(1);
  });

  it('starts a new file after resetSession()', () => {
    appendSessionEvent('FIRST', {});
    resetSession();
    appendSessionEvent('SECOND', {});

    const files = readdirSync(LOGS_DIR).filter((n) => n.startsWith('session-'));
    expect(files).toHaveLength(2);
  });
});

describe('listSessions', () => {
  it('returns sorted paths of session-*.jsonl files in a given directory', () => {
    const tmpDir = join(import.meta.dirname, '..', '..', '..', 'logs', '__listtest__');
    mkdirSync(tmpDir, { recursive: true });
    writeFileSync(join(tmpDir, 'session-2026-01-01T00:00:00.000Z-1.jsonl'), '');
    writeFileSync(join(tmpDir, 'session-2026-01-02T00:00:00.000Z-2.jsonl'), '');
    writeFileSync(join(tmpDir, 'session-2026-01-03T00:00:00.000Z-3.jsonl'), '');
    writeFileSync(join(tmpDir, 'not-a-session.txt'), '');

    const result = listSessions(tmpDir);

    rmSync(tmpDir, { recursive: true, force: true });

    expect(result).toHaveLength(3);
    expect(result[0]!).toMatch(/session-2026-01-01T00:00:00.000Z-1\.jsonl$/);
    expect(result[1]!).toMatch(/session-2026-01-02T00:00:00.000Z-2\.jsonl$/);
    expect(result[2]!).toMatch(/session-2026-01-03T00:00:00.000Z-3\.jsonl$/);
  });

  it('returns empty array when directory does not exist', () => {
    expect(listSessions('/nonexistent/path/that/does/not/exist')).toEqual([]);
  });
});

describe('pruneOldSessions', () => {
  it('deletes all but the most recent keepLast session files', () => {
    const tmpDir = join(import.meta.dirname, '..', '..', '..', 'logs', '__prunetest__');
    if (existsSync(tmpDir)) {
      rmSync(tmpDir, { recursive: true, force: true });
    }
    mkdirSync(tmpDir, { recursive: true });
    writeFileSync(join(tmpDir, 'session-2026-01-01T00:00:00.000Z-1.jsonl'), '');
    writeFileSync(join(tmpDir, 'session-2026-01-02T00:00:00.000Z-2.jsonl'), '');
    writeFileSync(join(tmpDir, 'session-2026-01-03T00:00:00.000Z-3.jsonl'), '');
    writeFileSync(join(tmpDir, 'session-2026-01-04T00:00:00.000Z-4.jsonl'), '');
    writeFileSync(join(tmpDir, 'session-2026-01-05T00:00:00.000Z-5.jsonl'), '');

    pruneOldSessions(3, tmpDir);

    const remaining = readdirSync(tmpDir).filter((n: string) => n.startsWith('session-'));
    expect(remaining).toHaveLength(3);

    const names = remaining.map((n: string) => n.replace(/.*session-/, '').replace(/\.jsonl$/, ''));
    expect(names.some((n: string) => n.includes('2026-01-01'))).toBe(false);
    expect(names.some((n: string) => n.includes('2026-01-02'))).toBe(false);
    expect(names.some((n: string) => n.includes('2026-01-03'))).toBe(true);
    expect(names.some((n: string) => n.includes('2026-01-04'))).toBe(true);
    expect(names.some((n: string) => n.includes('2026-01-05'))).toBe(true);

    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('does nothing when file count <= keepLast', () => {
    const tmpDir = join(import.meta.dirname, '..', '..', '..', 'logs', '__prunetest2__');
    mkdirSync(tmpDir, { recursive: true });
    writeFileSync(join(tmpDir, 'session-2026-01-01T00:00:00.000Z-1.jsonl'), '');
    writeFileSync(join(tmpDir, 'session-2026-01-02T00:00:00.000Z-2.jsonl'), '');

    pruneOldSessions(3, tmpDir);

    const remaining = readdirSync(tmpDir).filter((n: string) => n.startsWith('session-'));
    expect(remaining).toHaveLength(2);

    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns early when directory does not exist', () => {
    pruneOldSessions(5, '/nonexistent/path/that/does/not/exist');
  });

  it('round-trip: 55 files → prune(50) → exactly 50 remain', () => {
    const tmpDir = join(import.meta.dirname, '..', '..', '..', 'logs', '__roundtrip__');
    if (existsSync(tmpDir)) {
      rmSync(tmpDir, { recursive: true, force: true });
    }
    mkdirSync(tmpDir, { recursive: true });
    for (let i = 0; i < 55; i++) {
      writeFileSync(
        join(tmpDir, `session-2026-01-${String(i + 1).padStart(2, '0')}T00:00:00.000Z-${i}.jsonl`),
        '',
      );
    }

    pruneOldSessions(50, tmpDir);

    const remaining = readdirSync(tmpDir).filter((n: string) => n.startsWith('session-'));
    expect(remaining).toHaveLength(50);

    rmSync(tmpDir, { recursive: true, force: true });
  });
});

describe('resetSession with auto-prune', () => {
  it('prunes to keepLast when >keepLast sessions exist', () => {
    const tmpDir = join(import.meta.dirname, '..', '..', '..', 'logs', '__resetprune__');
    if (existsSync(tmpDir)) {
      rmSync(tmpDir, { recursive: true, force: true });
    }
    mkdirSync(tmpDir, { recursive: true });
    for (let i = 0; i < 55; i++) {
      writeFileSync(
        join(tmpDir, `session-2026-01-${String(i + 1).padStart(2, '0')}T00:00:00.000Z-${i}.jsonl`),
        '',
      );
    }

    // Override LOGS_DIR by writing to tmpDir, then calling resetSession
    // We need to test that resetSession calls pruneOldSessions with 50
    // Since LOGS_DIR is module-scoped, we use the tmpDir approach:
    // Create 55 files in tmpDir, then call pruneOldSessions(50, tmpDir) directly
    // to verify the prune logic works, then assert resetSession calls it.
    // Instead, we test by overriding the module's LOGS_DIR behavior:
    // The simplest approach: write 55 files to LOGS_DIR, call resetSession,
    // and assert only 50 remain.

    // Write 55 files to the actual LOGS_DIR
    for (let i = 0; i < 55; i++) {
      writeFileSync(
        join(
          LOGS_DIR,
          `session-2026-01-${String(i + 1).padStart(2, '0')}T00:00:00.000Z-${i}.jsonl`,
        ),
        '',
      );
    }

    const beforeCount = readdirSync(LOGS_DIR).filter((n) => n.startsWith('session-')).length;
    expect(beforeCount).toBe(55);

    resetSession();

    const afterCount = readdirSync(LOGS_DIR).filter((n) => n.startsWith('session-')).length;
    expect(afterCount).toBe(50);

    // Clean up
    for (const f of readdirSync(LOGS_DIR).filter((n) => n.startsWith('session-'))) {
      rmSync(join(LOGS_DIR, f));
    }
  });

  it('does nothing when ≤keepLast sessions exist', () => {
    // Reset first to clean up from previous test
    resetSession();

    // Write 3 files to LOGS_DIR
    for (let i = 0; i < 3; i++) {
      writeFileSync(
        join(
          LOGS_DIR,
          `session-2026-01-${String(i + 1).padStart(2, '0')}T00:00:00.000Z-${i}.jsonl`,
        ),
        '',
      );
    }

    const beforeCount = readdirSync(LOGS_DIR).filter((n) => n.startsWith('session-')).length;
    expect(beforeCount).toBe(3);

    resetSession();

    const afterCount = readdirSync(LOGS_DIR).filter((n) => n.startsWith('session-')).length;
    expect(afterCount).toBe(3);

    // Clean up
    for (const f of readdirSync(LOGS_DIR).filter((n) => n.startsWith('session-'))) {
      rmSync(join(LOGS_DIR, f));
    }
  });
});

describe('readSession', () => {
  it('returns empty array for a non-existent file', () => {
    const result = readSession('/nonexistent/path/session-2026-01-01T00:00:00.000Z-1.jsonl');
    expect(result).toEqual([]);
  });

  it('returns parsed entries from a single-entry file', () => {
    const tmpDir = join(import.meta.dirname, '..', '..', '..', 'logs', '__readtest__');
    if (existsSync(tmpDir)) {
      rmSync(tmpDir, { recursive: true, force: true });
    }
    mkdirSync(tmpDir, { recursive: true });
    const filePath = join(tmpDir, 'session-2026-01-01T00:00:00.000Z-1.jsonl');
    const entry = { ts: 1700000000000, kind: 'TEST', payload: { value: 42 } };
    writeFileSync(filePath, JSON.stringify(entry) + '\n');

    const result = readSession(filePath);

    rmSync(tmpDir, { recursive: true, force: true });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ ts: 1700000000000, kind: 'TEST' });
    expect((result[0]!.payload as { value: number }).value).toBe(42);
  });

  it('returns parsed entries from a multi-entry file, skipping blank lines', () => {
    const tmpDir = join(import.meta.dirname, '..', '..', '..', 'logs', '__readtest__');
    if (existsSync(tmpDir)) {
      rmSync(tmpDir, { recursive: true, force: true });
    }
    mkdirSync(tmpDir, { recursive: true });
    const filePath = join(tmpDir, 'session-2026-01-01T00:00:00.000Z-1.jsonl');
    const entries = [
      { ts: 1700000000000, kind: 'A', payload: { n: 1 } },
      { ts: 1700000001000, kind: 'B', payload: { n: 2 } },
      { ts: 1700000002000, kind: 'C', payload: { n: 3 } },
    ];
    const content = entries.map((e) => JSON.stringify(e)).join('\n\n') + '\n';
    writeFileSync(filePath, content);

    const result = readSession(filePath);

    rmSync(tmpDir, { recursive: true, force: true });

    expect(result).toHaveLength(3);
    expect(result[0]).toMatchObject({ kind: 'A' });
    expect(result[1]).toMatchObject({ kind: 'B' });
    expect(result[2]).toMatchObject({ kind: 'C' });
  });
});

describe('getCurrentSessionFile', () => {
  it('returns null before any appendSessionEvent is called', () => {
    resetSession();
    expect(getCurrentSessionFile()).toBeNull();
  });

  it('returns a path after appendSessionEvent is called', () => {
    resetSession();
    appendSessionEvent('TEST', { value: 1 });
    const path = getCurrentSessionFile();
    expect(path).not.toBeNull();
    expect(typeof path).toBe('string');
    expect(path).toMatch(/session-\d{4}-\d{2}-\d{2}T.*\.jsonl$/);
  });
});
