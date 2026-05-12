import { expect, test } from 'bun:test';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { replayFixture } from './replayFixture';

function writeFixture(dir: string, name: string, content: string): string {
  const path = join(dir, name);
  writeFileSync(path, content);
  return path;
}

test('empty file returns initialState', () => {
  const dir = mkdtempSync(join(tmpdir(), 'replayFixture-'));
  try {
    const path = writeFixture(dir, 'empty.log', '');
    const state = replayFixture(path);
    expect(state.turn).toBe(0);
    expect(state.phase).toBe('lobby');
    expect(state.player.tier).toBe(1);
    expect(state.player.hero.hp).toBe(40);
  } finally {
    rmSync(dir, { recursive: true });
  }
});

test('single TAG_CHANGE event updates state', () => {
  const dir = mkdtempSync(join(tmpdir(), 'replayFixture-'));
  try {
    const path = writeFixture(dir, 'single.log', 'TAG_CHANGE Entity=0 tag=HEALTH value=35\n');
    const state = replayFixture(path);
    expect(state.player.hero.hp).toBe(35);
  } finally {
    rmSync(dir, { recursive: true });
  }
});

test('multi-line file with garbage lines returns correct final state', () => {
  const dir = mkdtempSync(join(tmpdir(), 'replayFixture-'));
  try {
    const path = writeFixture(
      dir,
      'multi.log',
      `garbage line that should be ignored
TAG_CHANGE Entity=0 tag=HEALTH value=30
another garbage line
TAG_CHANGE Entity=0 tag=RESOURCES value=6
more noise
TAG_CHANGE Entity=0 tag=PLAYER_TECH_LEVEL value=4
`,
    );
    const state = replayFixture(path);
    expect(state.player.hero.hp).toBe(30);
    expect(state.player.gold).toBe(6);
    expect(state.player.tier).toBe(4);
  } finally {
    rmSync(dir, { recursive: true });
  }
});

test('non-existent file throws', () => {
  const dir = mkdtempSync(join(tmpdir(), 'replayFixture-'));
  try {
    const path = join(dir, 'does-not-exist.log');
    expect(() => replayFixture(path)).toThrow();
  } finally {
    rmSync(dir, { recursive: true });
  }
});
