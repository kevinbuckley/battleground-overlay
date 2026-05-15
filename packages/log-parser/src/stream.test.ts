import { describe, expect, it } from 'bun:test';
import { appendFileSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { streamEvents } from './stream';
import type { HsEvent } from './types';

describe('streamEvents', () => {
  it('reads existing lines from file', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'overlay-test-'));
    const file = join(dir, 'Power.log');
    writeFileSync(file, 'TAG_CHANGE Entity=4 tag=HEALTH value=30\n');

    const events: HsEvent[] = [];
    const handle = await streamEvents(file, (e) => events.push(e));
    handle.close();

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ kind: 'TAG_CHANGE', tag: 'HEALTH', value: '30' });

    rmSync(dir, { recursive: true });
  });

  it('picks up new lines written after open', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'overlay-test-'));
    const file = join(dir, 'Power.log');
    writeFileSync(file, '');

    const events: HsEvent[] = [];
    const handle = await streamEvents(file, (e) => events.push(e));

    appendFileSync(file, 'TAG_CHANGE Entity=5 tag=ATK value=2\n');

    // Poll up to 2s for chokidar to fire and the event to land
    const deadline = Date.now() + 2000;
    while (Date.now() < deadline && !events.some((e) => e.kind === 'TAG_CHANGE')) {
      await new Promise((r) => setTimeout(r, 50));
    }

    handle.close();
    expect(events.some((e) => e.kind === 'TAG_CHANGE')).toBe(true);

    rmSync(dir, { recursive: true });
  });

  it('picks up ZONE_CHANGE_LIST lines', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'overlay-test-'));
    const file = join(dir, 'Power.log');
    writeFileSync(file, '');

    const events: HsEvent[] = [];
    const handle = await streamEvents(file, (e) => events.push(e));

    appendFileSync(file, 'ZONE_CHANGE_LIST ID=42\n');

    const deadline = Date.now() + 2000;
    while (Date.now() < deadline && !events.some((e) => e.kind === 'ZONE_CHANGE_LIST')) {
      await new Promise((r) => setTimeout(r, 50));
    }

    handle.close();
    expect(events.some((e) => e.kind === 'ZONE_CHANGE_LIST')).toBe(true);

    rmSync(dir, { recursive: true });
  });

  it('picks up SHOW_ENTITY lines', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'overlay-test-'));
    const file = join(dir, 'Power.log');
    writeFileSync(file, '');

    const events: HsEvent[] = [];
    const handle = await streamEvents(file, (e) => events.push(e));

    appendFileSync(file, 'SHOW_ENTITY - Updating Entity=5 CardID=CS2_168\n');

    const deadline = Date.now() + 2000;
    while (Date.now() < deadline && !events.some((e) => e.kind === 'SHOW_ENTITY')) {
      await new Promise((r) => setTimeout(r, 50));
    }

    handle.close();
    expect(events.some((e) => e.kind === 'SHOW_ENTITY')).toBe(true);

    rmSync(dir, { recursive: true });
  });

  it('close stops watcher — appended lines after close are ignored', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'overlay-test-'));
    const file = join(dir, 'Power.log');
    writeFileSync(file, '');

    const events: HsEvent[] = [];
    const handle = await streamEvents(file, (e) => events.push(e));
    handle.close();

    appendFileSync(file, 'TAG_CHANGE Entity=99 tag=HEALTH value=10\n');

    await new Promise((r) => setTimeout(r, 400));

    expect(events).toHaveLength(0);

    rmSync(dir, { recursive: true });
  });

  it('streams an empty file — onEvent never called, handle is non-null', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'overlay-test-'));
    const file = join(dir, 'Power.log');
    writeFileSync(file, '');

    const events: HsEvent[] = [];
    const handle = await streamEvents(file, (e) => events.push(e));

    expect(handle).not.toBeNull();
    expect(events).toHaveLength(0);

    handle.close();
    rmSync(dir, { recursive: true });
  });

  it('skips unparseable lines — one valid + one garbage → onEvent called exactly once', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'overlay-test-'));
    const file = join(dir, 'Power.log');
    writeFileSync(file, 'TAG_CHANGE Entity=4 tag=HEALTH value=30\nthis is garbage\n');

    const events: HsEvent[] = [];
    const handle = await streamEvents(file, (e) => events.push(e));
    handle.close();

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ kind: 'TAG_CHANGE', tag: 'HEALTH' });

    rmSync(dir, { recursive: true });
  });

  it('skips unparseable lines — only garbage → onEvent never called', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'overlay-test-'));
    const file = join(dir, 'Power.log');
    writeFileSync(file, 'random garbage line 1\nanother bad line\nmore nonsense\n');

    const events: HsEvent[] = [];
    const handle = await streamEvents(file, (e) => events.push(e));
    handle.close();

    expect(events).toHaveLength(0);

    rmSync(dir, { recursive: true });
  });
});
