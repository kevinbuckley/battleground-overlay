import { readFileSync } from 'node:fs';
import { parseLine } from '@overlay/log-parser';
import type { HsEvent } from '@overlay/log-parser';

export function loadFixture(path: string): HsEvent[] {
  const content = readFileSync(path, 'utf-8');
  const lines = content.split('\n');
  const events: HsEvent[] = [];
  for (const line of lines) {
    const event = parseLine(line);
    if (event !== null) {
      events.push(event);
    }
  }
  return events;
}
