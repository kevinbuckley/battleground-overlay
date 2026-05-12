import { appendFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const LOGS_DIR = join(import.meta.dirname, '..', '..', '..', 'logs');

let sessionFile: string | null = null;
let sessionCounter = 0;

function getSessionFile(): string {
  if (!sessionFile) {
    mkdirSync(LOGS_DIR, { recursive: true });
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    sessionFile = join(LOGS_DIR, `session-${ts}-${++sessionCounter}.jsonl`);
  }
  return sessionFile;
}

export function appendSessionEvent(kind: string, payload: unknown): void {
  const line = JSON.stringify({ ts: Date.now(), kind, payload }) + '\n';
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
