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

/** Read a session JSONL file and print each entry as formatted text. */
export function reviewSession(filePath: string): void {
  for (const line of reviewSessionLines(filePath)) {
    console.log(line);
  }
}

if (import.meta.main) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: bun review-session.ts <path-to-session.jsonl>');
    process.exit(1);
  }
  reviewSession(filePath);
}
