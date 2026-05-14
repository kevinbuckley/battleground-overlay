import { parseBlockEnd, parseBlockStart } from './parseBlock';
import { parseFullEntity } from './parseFullEntity';
import { parseShowEntity } from './parseShowEntity';
import { parseTagChange } from './parseTagChange';
import { parseZoneChangeList } from './parseZoneChangeList';
import type { HsEvent } from './types';

export function parseLine(line: string): HsEvent | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const result =
    parseTagChange(trimmed) ??
    parseFullEntity(trimmed) ??
    parseBlockStart(trimmed) ??
    parseBlockEnd(trimmed) ??
    parseZoneChangeList(trimmed) ??
    parseShowEntity(trimmed);

  return result;
}

export { parseBlockEnd, parseBlockStart } from './parseBlock';
export { parseFullEntity } from './parseFullEntity';
export { parseShowEntity } from './parseShowEntity';
export { parseTagChange } from './parseTagChange';
export { parseZoneChangeList } from './parseZoneChangeList';
export { runFixtureTest } from './fixtureTest';

export type {
  HsEvent,
  TagChange,
  FullEntity,
  ShowEntity,
  BlockStart,
  BlockEnd,
  ZoneChangeList,
} from './types';

export { streamEvents } from './stream';
export type { StreamHandle } from './stream';
export { findActiveLogDir } from './findActiveLogDir';
export { waitForLogFile } from './waitForLogFile';
