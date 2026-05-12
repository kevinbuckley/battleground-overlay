import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadFixture } from './loadFixture';

function makeFixture(lines: string[]): string {
  const dir = mkdtempSync(join(tmpdir(), 'replay-test-'));
  const path = join(dir, 'test.log');
  writeFileSync(path, lines.join('\n'));
  return path;
}

function cleanup(path: string) {
  const dir = join(path, '..');
  rmSync(dir, { recursive: true });
}

describe('loadFixture', () => {
  afterEach(() => {
    // cleanup handled per-test since paths differ
  });

  it('returns empty array for a file with no parseable lines', () => {
    const path = makeFixture(['garbage line 1', 'garbage line 2', '']);
    try {
      const result = loadFixture(path);
      expect(result).toEqual([]);
    } finally {
      cleanup(path);
    }
  });

  it('filters nulls and returns only parsed events', () => {
    const path = makeFixture([
      'GARBAGE LINE',
      'TAG_CHANGE Entity=1 tag=PLAYSTATE value=FINISHED',
      'MORE GARBAGE',
    ]);
    try {
      const result = loadFixture(path);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        kind: 'TAG_CHANGE',
        entity: '1',
        tag: 'PLAYSTATE',
        value: 'FINISHED',
      });
    } finally {
      cleanup(path);
    }
  });

  it('returns 2 events from a 3-line fixture with 1 garbage line', () => {
    const path = makeFixture([
      'GARBAGE LINE',
      'TAG_CHANGE Entity=1 tag=PLAYSTATE value=FINISHED',
      'TAG_CHANGE Entity=2 tag=HEALTH value=30',
    ]);
    try {
      const result = loadFixture(path);
      expect(result).toHaveLength(2);
    } finally {
      cleanup(path);
    }
  });
});
