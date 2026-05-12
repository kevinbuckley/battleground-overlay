import { parseBlockEnd, parseBlockStart } from './parseBlock';
import { parseFullEntity } from './parseFullEntity';
import { parseTagChange } from './parseTagChange';
import type { HsEvent } from './types';

export function parseLine(line: string): HsEvent | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const result =
    parseTagChange(trimmed) ??
    parseFullEntity(trimmed) ??
    parseBlockStart(trimmed) ??
    parseBlockEnd(trimmed);

  if (result) return result;

  if (trimmed.startsWith('ZONE_CHANGE_LIST')) {
    const m = /^ZONE_CHANGE_LIST ID=(\d+)$/.exec(trimmed);
    if (m) {
      return { kind: 'ZONE_CHANGE_LIST', id: Number(m[1]) };
    }
  }

  if (trimmed.startsWith('SHOW_ENTITY')) {
    const m = /^SHOW_ENTITY cardId=(\S+)(?:\s+entity=(\S+))?$/.exec(trimmed);
    if (m) {
      const cardId = m[1] as string;
      const entity = (m[2] ?? '') as string;
      return {
        kind: 'SHOW_ENTITY',
        cardId,
        entity,
      };
    }
  }

  return null;
}

export { parseBlockEnd, parseBlockStart } from './parseBlock';
export { parseFullEntity } from './parseFullEntity';
export { parseTagChange } from './parseTagChange';

export type {
  HsEvent,
  TagChange,
  FullEntity,
  ShowEntity,
  BlockStart,
  BlockEnd,
  ZoneChangeList,
} from './types';
