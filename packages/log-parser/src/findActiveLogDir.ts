import { existsSync, readdirSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

// Battle.net Mac client writes session logs under /Applications/Hearthstone/Logs/.
// Older docs reference ~/Library/Logs/Blizzard/Hearthstone/Logs, which doesn't
// match the current Mac client install. Try the Applications path first, then
// fall back to the legacy ~/Library path.
const HS_LOG_BASE_PRIMARY = '/Applications/Hearthstone/Logs';
const HS_LOG_BASE_LEGACY = join(homedir(), 'Library', 'Logs', 'Blizzard', 'Hearthstone', 'Logs');
const HS_LOG_BASE = HS_LOG_BASE_PRIMARY;

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

export function findActiveLogDir(baseDir?: string): string {
  const bases = baseDir ? [baseDir] : [HS_LOG_BASE_PRIMARY, HS_LOG_BASE_LEGACY];

  // Prefer the directory whose Power.log was most recently modified — HS often
  // creates an empty session directory on each launch but only writes Power.log
  // once a match starts, so the alphabetically-newest dir is not always correct.
  let best: { path: string; mtimeMs: number } | null = null;
  for (const base of bases) {
    for (const name of findHsLogDirCandidates(base)) {
      const dir = join(base, name);
      const power = join(dir, 'Power.log');
      if (!existsSync(power)) continue;
      const mtimeMs = statSync(power).mtimeMs;
      if (!best || mtimeMs > best.mtimeMs) best = { path: dir, mtimeMs };
    }
  }
  if (best) return best.path;

  // No dir has a Power.log yet; fall back to the alphabetically-newest dir so
  // the streamer can wait for Power.log to appear there.
  for (const base of bases) {
    const candidates = findHsLogDirCandidates(base);
    const latest = candidates[candidates.length - 1];
    if (latest) return join(base, latest);
  }
  throw new Error(`No Hearthstone log directories found in ${bases.join(', ')}`);
}
