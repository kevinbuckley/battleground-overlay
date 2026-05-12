import type { ZoneChangeList } from './types';

const ZONE_CHANGE_LIST_RE = /^ZONE_CHANGE_LIST ID=(\d+)$/;

export function parseZoneChangeList(line: string): ZoneChangeList | null {
  const m = ZONE_CHANGE_LIST_RE.exec(line.trim());
  if (!m) return null;
  return { kind: 'ZONE_CHANGE_LIST', id: Number(m[1]) };
}
