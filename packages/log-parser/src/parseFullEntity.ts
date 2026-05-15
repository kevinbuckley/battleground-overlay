import type { FullEntity } from './types';

// FULL_ENTITY - Updating Card=[name=<name> id=<id> cardId=<cardId> ...]
const UPDATING_RE = /^FULL_ENTITY - Updating Card=\[name=(.*?) id=(\d+)(?: cardId=(\S*))?/;
// FULL_ENTITY - Creating ID=<id> [CardID=<cardId>]
const CREATING_RE = /^FULL_ENTITY - Creating ID=(\d+)(?: CardID=(\S*))?/;

export function parseFullEntity(line: string): FullEntity | null {
  const trimmed = line.trim();

  const mu = UPDATING_RE.exec(trimmed);
  if (mu) {
    const [, name, idStr, cardId] = mu;
    const id = Number.parseInt(idStr ?? '0', 10);
    const result: FullEntity = { kind: 'FULL_ENTITY', id, cardId: cardId ?? '' };
    if (name) result.name = name;
    return result;
  }

  const mc = CREATING_RE.exec(trimmed);
  if (mc) {
    const [, idStr, cardId] = mc;
    const id = Number.parseInt(idStr ?? '0', 10);
    return { kind: 'FULL_ENTITY', id, cardId: cardId ?? '' };
  }

  return null;
}
