export interface TokenizedLine {
  depth: number;
  kind: string;
  payload: string;
}

const INDENT_SIZE = 4;

export function tokenizeLine(line: string): TokenizedLine | null {
  if (!line.trim()) return null;

  let depth = 0;
  let i = 0;
  while (i < line.length && line[i] === ' ') {
    i++;
    depth = Math.floor(i / INDENT_SIZE);
  }

  const content = line.slice(i);
  if (!content) return null;

  const spaceIdx = content.indexOf(' ');
  if (spaceIdx === -1) {
    return { depth, kind: content, payload: '' };
  }

  const kind = content.slice(0, spaceIdx);
  const payload = content.slice(spaceIdx + 1);
  return { depth, kind, payload };
}
