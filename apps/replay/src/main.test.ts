import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { run } from './main';

function makeFixture(lines: string[]): string {
  const dir = mkdtempSync(join(tmpdir(), 'replay-main-test-'));
  const path = join(dir, 'test.log');
  writeFileSync(path, lines.join('\n'));
  return path;
}

function cleanup(path: string) {
  const dir = join(path, '..');
  rmSync(dir, { recursive: true });
}

describe('run', () => {
  it('returns a string containing "## Turn" for a 2-event fixture', () => {
    const path = makeFixture([
      'BLOCK_START BlockType=TRIGGER Entity=1 EffectCardId=TB_BaconShop_StartGame EffectIndex=0 Target=1 SubOption=None',
      'TAG_CHANGE Entity=0 tag=HEALTH value=30',
    ]);
    try {
      const result = run(path);
      expect(typeof result).toBe('string');
      expect(result).toContain('## Turn');
    } finally {
      cleanup(path);
    }
  });

  it('includes state output with turn and phase', () => {
    const path = makeFixture([
      'BLOCK_START BlockType=TRIGGER Entity=1 EffectCardId=TB_BaconShop_StartGame EffectIndex=0 Target=1 SubOption=None',
      'TAG_CHANGE Entity=0 tag=HEALTH value=30',
      'TAG_CHANGE Entity=0 tag=RESOURCES value=5',
    ]);
    try {
      const result = run(path);
      expect(result).toContain('turn: 1');
      expect(result).toContain('phase: shopping');
      expect(result).toContain('player hp: 30');
    } finally {
      cleanup(path);
    }
  });

  it('returns a string containing "## Turn" for an empty fixture', () => {
    const path = makeFixture([]);
    try {
      const result = run(path);
      expect(typeof result).toBe('string');
      expect(result).toContain('## Turn');
    } finally {
      cleanup(path);
    }
  });
});
