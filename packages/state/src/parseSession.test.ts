import { describe, expect, it } from 'bun:test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseSession } from './parseSession';

function writeFixtureFile(lines: string[]): string {
  const dir = join(import.meta.dir, '..', '..', '..', 'fixtures');
  mkdirSync(dir, { recursive: true });
  const filePath = join(dir, 'session-test-replay.jsonl');
  writeFileSync(filePath, lines.join('\n') + '\n', 'utf8');
  return filePath;
}

describe('parseSession', () => {
  const tmpFile = writeFixtureFile([
    JSON.stringify({
      ts: 1,
      kind: 'TAG_CHANGE',
      payload: 'TAG_CHANGE Entity=0 tag=PLAYSTATE value=FOUND',
    }),
    JSON.stringify({
      ts: 2,
      kind: 'BLOCK_START',
      payload:
        'BLOCK_START BlockType=TRIGGER Entity=GameEntity EffectCardId=TB_BaconShop_StartGame EffectIndex=0 Target=0 SubOption=-1 TriggerKeyword=NONE',
    }),
    JSON.stringify({
      ts: 3,
      kind: 'TAG_CHANGE',
      payload: 'TAG_CHANGE Entity=0 tag=PLAYER_TECH_LEVEL value=2',
    }),
    JSON.stringify({
      ts: 4,
      kind: 'TAG_CHANGE',
      payload: 'TAG_CHANGE Entity=0 tag=HEALTH value=30',
    }),
    JSON.stringify({
      ts: 5,
      kind: 'TAG_CHANGE',
      payload: 'TAG_CHANGE Entity=0 tag=RESOURCES value=4',
    }),
    JSON.stringify({ ts: 6, kind: 'session_end', payload: '' }),
  ]);

  it('returns final state after replaying a session', () => {
    const snapshots = parseSession(tmpFile);
    expect(snapshots.length).toBeGreaterThan(0);
    const last = snapshots[snapshots.length - 1];
    expect(last.turn).toBe(1);
    expect(last.player.hero.hp).toBe(30);
    expect(last.player.gold).toBe(4);
    expect(last.player.tier).toBe(2);
  });

  it('captures snapshots at TAG_CHANGE boundaries', () => {
    const snapshots = parseSession(tmpFile);
    expect(snapshots.length).toBeGreaterThanOrEqual(2);
  });

  it('returns initial state for empty session', () => {
    const emptyFile = writeFixtureFile([]);
    const snapshots = parseSession(emptyFile);
    expect(snapshots.length).toBe(1);
    expect(snapshots[0].turn).toBe(0);
    expect(snapshots[0].phase).toBe('lobby');
  });

  it('skips malformed JSONL lines', () => {
    const malformedFile = writeFixtureFile([
      'this is not json',
      JSON.stringify({
        ts: 1,
        kind: 'TAG_CHANGE',
        payload: 'TAG_CHANGE Entity=0 tag=PLAYSTATE value=FOUND',
      }),
      '{ broken json',
      JSON.stringify({ ts: 2, kind: 'session_end', payload: '' }),
    ]);
    const snapshots = parseSession(malformedFile);
    expect(snapshots.length).toBeGreaterThan(0);
  });
});
