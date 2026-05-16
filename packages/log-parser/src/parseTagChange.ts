import type { TagChange } from './types';

// Matches: TAG_CHANGE Entity=<entity> tag=<tag> value=<value>
const TAG_CHANGE_RE = /^TAG_CHANGE Entity=(.+?) tag=(\S+) value=(\S+)$/;
// Inside a descriptor like "[entityName=... id=N ...]" the numeric id appears as `id=N`.
const ID_IN_DESCRIPTOR_RE = /\bid=(\d+)\b/;

function normaliseEntity(raw: string): string {
  if (/^\d+$/.test(raw)) return raw;
  const m = ID_IN_DESCRIPTOR_RE.exec(raw);
  if (m?.[1]) return m[1];
  return raw;
}

export function parseTagChange(line: string): TagChange | null {
  const m = TAG_CHANGE_RE.exec(line.trim());
  if (!m) return null;
  const [, entity, tag, value] = m;
  if (!entity || !tag || !value) return null;
  return { kind: 'TAG_CHANGE', entity: normaliseEntity(entity), entityRaw: entity, tag, value };
}
