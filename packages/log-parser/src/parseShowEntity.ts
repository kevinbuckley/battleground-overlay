import type { ShowEntity } from './types';

/**
 * Parse a SHOW_ENTITY log line from Power.log.
 *
 * Expected format:
 *   SHOW_ENTITY - Updating Entity=123 CardID=TB_BaconHeroes_83
 *
 * Returns null when the line doesn't match.
 */
export function parseShowEntity(line: string): ShowEntity | null {
  const trimmed = line.trim();
  const m = /^SHOW_ENTITY\s+-\s+Updating\s+Entity=(\d+)\s+CardID=(\S+)/.exec(trimmed);
  if (!m) return null;
  return {
    kind: 'SHOW_ENTITY',
    entity: m[1] as string,
    cardId: m[2] as string,
  };
}
