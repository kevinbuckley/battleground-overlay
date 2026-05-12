import { describe, expect, it, beforeEach } from 'bun:test';
import { appendSessionEvent, resetSession } from './sessionLog';
import { readdirSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';

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
