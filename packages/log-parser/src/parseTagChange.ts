import type { TagChange } from './types';

// Matches: TAG_CHANGE Entity=<entity> tag=<tag> value=<value>
const TAG_CHANGE_RE = /^TAG_CHANGE Entity=(.+?) tag=(\S+) value=(\S+)$/;

export function parseTagChange(line: string): TagChange | null {
  const m = TAG_CHANGE_RE.exec(line.trim());
  if (!m) return null;
  const [, entity, tag, value] = m;
  if (!entity || !tag || !value) return null;
  return { kind: 'TAG_CHANGE', entity, tag, value };
}
