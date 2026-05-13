import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const LOGS_DIR = join(import.meta.dirname, '..', '..', '..', 'logs');

let sessionFile: string | null = null;
let sessionCounter = 0;

export interface SessionEntry {
  ts: number;
  kind: string;
  payload: unknown;
}

function getSessionFile(): string {
  if (!sessionFile) {
    mkdirSync(LOGS_DIR, { recursive: true });
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    sessionFile = join(LOGS_DIR, `session-${ts}-${++sessionCounter}.jsonl`);
  }
  return sessionFile;
}

export function appendSessionEvent(kind: string, payload: unknown): void {
  const line = `${JSON.stringify({ ts: Date.now(), kind, payload })}\n`;
  appendFileSync(getSessionFile(), line, 'utf8');
}

export function resetSession(): void {
  sessionFile = null;
}

export function listSessions(logsDir?: string): string[] {
  const dir = logsDir ?? LOGS_DIR;
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((n: string) => n.startsWith('session-') && n.endsWith('.jsonl'))
    .sort()
    .map((n: string) => join(dir, n));
}

export function pruneOldSessions(keepLast: number, logsDir?: string): void {
  const dir = logsDir ?? LOGS_DIR;
  if (!existsSync(dir)) return;
  const files = readdirSync(dir)
    .filter((n: string) => n.startsWith('session-') && n.endsWith('.jsonl'))
    .sort();
  if (files.length <= keepLast) return;
  const toRemove = files.slice(0, files.length - keepLast);
  for (const f of toRemove) {
    rmSync(join(dir, f), { force: true });
  }
}

export function readSession(path: string): SessionEntry[] {
  if (!existsSync(path)) return [];
  const content = readFileSync(path, 'utf8');
  const lines = content.split('\n');
  const entries: SessionEntry[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '') continue;
    try {
      entries.push(JSON.parse(trimmed) as SessionEntry);
    } catch {
      // skip malformed lines
    }
  }
  return entries;
}
