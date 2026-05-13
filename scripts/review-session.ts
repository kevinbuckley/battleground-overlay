import { readFileSync } from 'node:fs';

/** Format a single JSONL session entry as `[kind] payload-summary`. */
export function formatEntry(line: string): string {
  const trimmed = line.trim();
  if (!trimmed) return '';
  try {
    const entry = JSON.parse(trimmed) as { kind?: string; payload?: unknown };
    const kind = entry.kind ?? 'unknown';
    const payload = entry.payload;

    let summary = '';
    if (payload === null || payload === undefined) {
      summary = '';
    } else if (typeof payload === 'string') {
      summary = payload.length > 80 ? `${payload.slice(0, 77)}...` : payload;
    } else if (typeof payload === 'object') {
      const obj = payload as Record<string, unknown>;
      const keys = Object.keys(obj).slice(0, 3);
      summary = keys.map((k) => `${k}:${JSON.stringify(obj[k])}`).join(' ');
    } else {
      summary = String(payload);
    }

    return summary ? `[${kind}] ${summary}` : `[${kind}]`;
  } catch {
    return `[parse-error] ${trimmed.slice(0, 40)}`;
  }
}

/** Read a session JSONL file and return each entry as formatted text lines. */
export function reviewSessionLines(filePath: string): string[] {
  const content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const result: string[] = [];
  for (const line of lines) {
    const formatted = formatEntry(line);
    if (formatted) result.push(formatted);
  }
  return result;
}

/** A parsed session log entry. */
export interface SessionEntry {
  ts: number;
  kind: string;
  payload: unknown;
}

/** Read a session JSONL file and return parsed SessionEntry[]. */
export function readSession(filePath: string): SessionEntry[] {
  const content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const result: SessionEntry[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      result.push(JSON.parse(trimmed) as SessionEntry);
    } catch {
      // skip unparseable lines
    }
  }
  return result;
}

/** Filter session entries to those whose payload contains a turn in [minTurn, maxTurn]. */
export function filterByTurnRange(
  entries: SessionEntry[],
  minTurn: number,
  maxTurn: number,
): SessionEntry[] {
  return entries.filter((entry) => {
    const payload = entry.payload;
    if (payload === null || payload === undefined || typeof payload !== 'object') {
      return false;
    }
    const obj = payload as Record<string, unknown>;
    const turn = obj.turn;
    if (typeof turn !== 'number') {
      return false;
    }
    return turn >= minTurn && turn <= maxTurn;
  });
}

/** Read a session JSONL file and print each entry as formatted text. */
export function reviewSession(filePath: string): void {
  for (const line of reviewSessionLines(filePath)) {
    console.log(line);
  }
}

/** Format a parsed SessionEntry as `[kind] HH:MM:SS payload-summary`. */
export function formatSessionLine(entry: SessionEntry): string {
  const d = new Date(entry.ts * 1000);
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  const ss = String(d.getUTCSeconds()).padStart(2, '0');
  const ts = `${hh}:${mm}:${ss}`;
  let summary = '';
  const payload = entry.payload;
  if (payload === null || payload === undefined) {
    summary = '';
  } else if (typeof payload === 'string') {
    summary = payload.length > 60 ? `${payload.slice(0, 57)}...` : payload;
  } else if (typeof payload === 'object') {
    summary = JSON.stringify(payload);
    if (summary.length > 60) {
      summary = `${summary.slice(0, 57)}...`;
    }
  } else {
    summary = String(payload);
  }
  return summary ? `[${entry.kind}] ${ts} ${summary}` : `[${entry.kind}] ${ts}`;
}

if (import.meta.main) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: bun review-session.ts <path-to-session.jsonl>');
    process.exit(1);
  }
  reviewSession(filePath);
}
