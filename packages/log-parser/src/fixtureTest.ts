import { readFileSync } from 'node:fs';

import { parseLine } from './index';
import type { HsEvent } from './types';

export function runFixtureTest(fixturePath: string, expectedEvents: HsEvent[]): void {
  const lines = readLines(fixturePath);
  const events: HsEvent[] = [];
  for (const line of lines) {
    const parsed = parseLine(line);
    if (parsed) events.push(parsed);
  }

  if (events.length !== expectedEvents.length) {
    throw new Error(
      `Event count mismatch: expected ${expectedEvents.length}, got ${events.length}`,
    );
  }

  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    const exp = expectedEvents[i];
    if (e === undefined || exp === undefined) {
      throw new Error(`Event type mismatch at index ${i}: expected ${exp?.kind}, got ${e?.kind}`);
    }
    if (e.kind !== exp.kind) {
      throw new Error(`Event type mismatch at index ${i}: expected ${exp.kind}, got ${e.kind}`);
    }
  }
}

function readLines(filePath: string): string[] {
  return readFileSync(filePath, 'utf-8').split('\n');
}
