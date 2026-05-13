import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { initialState } from '@overlay/state';
import { loadFixture } from './loadFixture';
import { Scrubber } from './scrubber';

function makeFixture(lines: string[]): string {
  const dir = mkdtempSync(join(tmpdir(), 'scrubber-test-'));
  const path = join(dir, 'test.log');
  writeFileSync(path, lines.join('\n'));
  return path;
}

function cleanup(path: string) {
  const dir = join(path, '..');
  rmSync(dir, { recursive: true });
}

describe('Scrubber', () => {
  it('seek(0) returns initialState', () => {
    const path = makeFixture([
      'TAG_CHANGE Entity=1 tag=PLAYSTATE value=FINISHED',
      'TAG_CHANGE Entity=2 tag=HEALTH value=30',
    ]);
    try {
      const events = loadFixture(path);
      const s = new Scrubber(events);
      const state = s.seek(0);
      expect(state).toEqual(initialState());
    } finally {
      cleanup(path);
    }
  });

  it('seek(1) returns state after first event', () => {
    const path = makeFixture([
      'BLOCK_START BlockType=TRIGGER Entity=1 EffectCardId=TB_BaconShop_StartGame EffectIndex=0 Target=1 SubOption=None',
    ]);
    try {
      const events = loadFixture(path);
      const s = new Scrubber(events);
      const state = s.seek(1);
      expect(state.turn).toBe(1);
      expect(state.phase).toBe('shopping');
    } finally {
      cleanup(path);
    }
  });

  it('seek(n) applies first n events in order', () => {
    const path = makeFixture([
      'BLOCK_START BlockType=TRIGGER Entity=1 EffectCardId=TB_BaconShop_StartGame EffectIndex=0 Target=1 SubOption=None',
      'TAG_CHANGE Entity=0 tag=HEALTH value=30',
    ]);
    try {
      const events = loadFixture(path);
      const s = new Scrubber(events);
      const state = s.seek(2);
      expect(state.turn).toBe(1);
      expect(state.player.hero.hp).toBe(30);
    } finally {
      cleanup(path);
    }
  });

  it('length returns event count', () => {
    const path = makeFixture([
      'TAG_CHANGE Entity=1 tag=PLAYSTATE value=FINISHED',
      'TAG_CHANGE Entity=2 tag=HEALTH value=30',
      'TAG_CHANGE Entity=3 tag=RESOURCES value=5',
    ]);
    try {
      const events = loadFixture(path);
      const s = new Scrubber(events);
      expect(s.length).toBe(3);
    } finally {
      cleanup(path);
    }
  });

  it('seek(0) on empty events returns initialState', () => {
    const s = new Scrubber([]);
    expect(s.length).toBe(0);
    expect(s.seek(0)).toEqual(initialState());
  });

  it('seek out of bounds throws', () => {
    const path = makeFixture(['TAG_CHANGE Entity=1 tag=PLAYSTATE value=FINISHED']);
    try {
      const events = loadFixture(path);
      const s = new Scrubber(events);
      expect(() => s.seek(5)).toThrow();
    } finally {
      cleanup(path);
    }
  });

  it('seek(2) sets currentIndex and getState() reflects 2 events', () => {
    const path = makeFixture([
      'TAG_CHANGE Entity=0 tag=HEALTH value=30',
      'TAG_CHANGE Entity=0 tag=RESOURCES value=3',
      'TAG_CHANGE Entity=0 tag=PLAYER_TECH_LEVEL value=3',
      'TAG_CHANGE Entity=0 tag=NUM_CARDS_IN_HAND value=2',
      'TAG_CHANGE Entity=1 tag=PLAYSTATE value=FINISHED',
    ]);
    try {
      const events = loadFixture(path);
      const s = new Scrubber(events);
      const state = s.seek(2);
      expect(s.currentIndex).toBe(2);
      const gs = s.getState();
      expect(gs.player.hero.hp).toBe(30);
      expect(gs.player.gold).toBe(3);
    } finally {
      cleanup(path);
    }
  });

  it('seek(0) returns initialState', () => {
    const path = makeFixture([
      'TAG_CHANGE Entity=1 tag=PLAYSTATE value=FINISHED',
      'TAG_CHANGE Entity=0 tag=HEALTH value=30',
    ]);
    try {
      const events = loadFixture(path);
      const s = new Scrubber(events);
      s.seek(1);
      const state = s.seek(0);
      expect(state).toEqual(initialState());
    } finally {
      cleanup(path);
    }
  });

  it('replay() seeks to the end', () => {
    const path = makeFixture([
      'BLOCK_START BlockType=TRIGGER Entity=1 EffectCardId=TB_BaconShop_StartGame EffectIndex=0 Target=1 SubOption=None',
      'TAG_CHANGE Entity=0 tag=HEALTH value=30',
    ]);
    try {
      const events = loadFixture(path);
      const s = new Scrubber(events);
      const state = s.replay();
      expect(state.turn).toBe(1);
      expect(state.player.hero.hp).toBe(30);
    } finally {
      cleanup(path);
    }
  });

  it('stepBackward() at tick 0 does not throw and returns 0', () => {
    const path = makeFixture([
      'TAG_CHANGE Entity=0 tag=HEALTH value=30',
      'TAG_CHANGE Entity=0 tag=RESOURCES value=3',
    ]);
    try {
      const events = loadFixture(path);
      const s = new Scrubber(events);
      const result = s.stepBackward();
      expect(result).toBe(0);
      expect(s.currentIndex).toBe(0);
    } finally {
      cleanup(path);
    }
  });

  it('stepForward() past the last event returns the final state without throwing', () => {
    const path = makeFixture([
      'TAG_CHANGE Entity=0 tag=HEALTH value=30',
      'TAG_CHANGE Entity=0 tag=RESOURCES value=3',
    ]);
    try {
      const events = loadFixture(path);
      const s = new Scrubber(events);
      s.seek(2);
      expect(s.currentIndex).toBe(2);
      const result = s.stepForward();
      expect(result).toBe(2);
      expect(s.currentIndex).toBe(2);
    } finally {
      cleanup(path);
    }
  });
});
