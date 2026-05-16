import { parseBlockEnd, parseBlockStart } from './parseBlock';
import { parseFullEntity } from './parseFullEntity';
import { parsePlayerInfo } from './parsePlayerInfo';
import { parsePlayerName } from './parsePlayerName';
import { parseShowEntity } from './parseShowEntity';
import { parseTagChange } from './parseTagChange';
import { parseZoneChangeList } from './parseZoneChangeList';
import type { HsEvent } from './types';

// HS Power.log lines are prefixed with a log level + timestamp + caller, e.g.
//   D 15:47:09.1222540 GameState.DebugPrintPower() - TAG_CHANGE Entity=19 ...
// Strip that prefix so offline fixture parsing matches the live stream parser.
const HS_LOG_PREFIX_RE = /^[DIWE]\s+\d{1,2}:\d{2}:\d{2}\.\d+\s+\S+\(\)\s+-\s+/;

export function parseLine(line: string): HsEvent | null {
  const trimmed = line.replace(HS_LOG_PREFIX_RE, '').trim();
  if (!trimmed) return null;

  const result =
    parseTagChange(trimmed) ??
    parseFullEntity(trimmed) ??
    parseBlockStart(trimmed) ??
    parseBlockEnd(trimmed) ??
    parseZoneChangeList(trimmed) ??
    parsePlayerInfo(trimmed) ??
    parsePlayerName(trimmed) ??
    parseShowEntity(trimmed);

  return result;
}

export { parseBlockEnd, parseBlockStart } from './parseBlock';
export { parseFullEntity } from './parseFullEntity';
export { parsePlayerInfo } from './parsePlayerInfo';
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
  PlayerInfo,
} from './types';

export { streamEvents } from './stream';
export type { StreamHandle } from './stream';
export { findActiveLogDir, findHsLogDirCandidates } from './findActiveLogDir';
export { waitForLogFile } from './waitForLogFile';
