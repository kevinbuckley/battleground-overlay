import { readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const HS_LOG_BASE = join(homedir(), 'Library', 'Logs', 'Blizzard', 'Hearthstone', 'Logs');

export function findHsLogDirCandidates(baseDir: string): string[] {
  try {
    const entries = readdirSync(baseDir, { withFileTypes: true });
    return entries
      .filter((e) => e.isDirectory() && e.name.startsWith('Hearthstone_'))
      .map((e) => e.name)
      .sort();
  } catch {
    return [];
  }
}

export function findActiveLogDir(baseDir: string = HS_LOG_BASE): string {
  const candidates = findHsLogDirCandidates(baseDir);

  if (candidates.length === 0) {
    throw new Error(`No Hearthstone log directories found in ${baseDir}`);
  }

  const latest = candidates[candidates.length - 1];
  if (!latest) {
    throw new Error(`No Hearthstone log directories found in ${baseDir}`);
  }
  return join(baseDir, latest);
}
