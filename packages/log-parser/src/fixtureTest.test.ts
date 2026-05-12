import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { runFixtureTest } from './fixtureTest';
import { parseLine } from './index';
import type { HsEvent } from './types';

function writeFixture(name: string, content: string): string {
  const dir = mkdtempSync(join(tmpdir(), 'fixture-test-'));
  const path = join(dir, name);
  writeFileSync(path, content);
  return path;
}

function cleanup(path: string): void {
  const dir = path.split('/').slice(0, -1).join('/');
  try {
    rmSync(dir, { recursive: true, force: true });
  } catch {
    // ignore
  }
}

const SAMPLE_TAG_CHANGE = 'TAG_CHANGE Entity=123 tag=HEALTH value=30';
const SAMPLE_FULL_ENTITY = 'FULL_ENTITY - Creating ID=123 CardID=555';
const GARBAGE_LINE = '2024-01-01T00:00:00.000 some random log line';

export function fixtureTestExactMatch(): void {
  const lines = [SAMPLE_TAG_CHANGE, SAMPLE_FULL_ENTITY].join('\n');
  const path = writeFixture('exact.log', lines);

  const e1 = parseLine(SAMPLE_TAG_CHANGE);
  const e2 = parseLine(SAMPLE_FULL_ENTITY);
  if (!e1 || !e2) throw new Error('parseLine returned null for valid line');
  const expected: HsEvent[] = [e1, e2];
  runFixtureTest(path, expected);
  cleanup(path);
}

export function fixtureTestWrongCount(): void {
  const lines = [SAMPLE_TAG_CHANGE, SAMPLE_FULL_ENTITY, GARBAGE_LINE].join('\n');
  const path = writeFixture('wrong-count.log', lines);

  const e1 = parseLine(SAMPLE_TAG_CHANGE);
  if (!e1) throw new Error('parseLine returned null for valid line');
  const expected: HsEvent[] = [e1];
  try {
    runFixtureTest(path, expected);
    throw new Error('Expected runFixtureTest to throw');
  } catch (err) {
    if (!(err instanceof Error) || !err.message.includes('Event count mismatch')) {
      throw err;
    }
  } finally {
    cleanup(path);
  }
}

export function fixtureTestWrongType(): void {
  const lines = [SAMPLE_FULL_ENTITY, SAMPLE_TAG_CHANGE].join('\n');
  const path = writeFixture('wrong-type.log', lines);

  const e1 = parseLine(SAMPLE_FULL_ENTITY);
  const e2 = parseLine(SAMPLE_TAG_CHANGE);
  if (!e1 || !e2) throw new Error('parseLine returned null for valid line');
  // Swap the expected order: expect FULL_ENTITY first, then TAG_CHANGE
  // but the fixture has TAG_CHANGE first, then FULL_ENTITY
  const expected: HsEvent[] = [e2, e1];
  try {
    runFixtureTest(path, expected);
    throw new Error('Expected runFixtureTest to throw');
  } catch (err) {
    if (!(err instanceof Error) || !err.message.includes('Event type mismatch')) {
      throw err;
    }
  } finally {
    cleanup(path);
  }
}

// Run tests
let passed = 0;
let failed = 0;

function run(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  PASS ${name}`);
    passed++;
  } catch (err) {
    console.log(`  FAIL ${name}: ${(err as Error).message}`);
    failed++;
  }
}

console.log('Fixture integration test harness:');
run('exact match passes', fixtureTestExactMatch);
run('wrong count fails', fixtureTestWrongCount);
run('wrong type fails', fixtureTestWrongType);
console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
