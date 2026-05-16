import { readFileSync, writeFileSync } from 'node:fs';

const PLAYER_INFO_RE =
  /Player EntityID=(\d+) PlayerID=(\d+) GameAccountId=\[hi=(-?\d+) lo=(-?\d+)\]/g;
const PLAYER_NAME_RE = /PlayerID=(\d+),\s*PlayerName=(.+?)\s*$/gm;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function collectLocalPlayerIds(raw: string): Set<number> {
  const local = new Set<number>();
  for (const match of raw.matchAll(PLAYER_INFO_RE)) {
    const playerId = Number.parseInt(match[2] ?? '', 10);
    const hi = match[3] ?? '0';
    if (!Number.isNaN(playerId) && hi !== '0') {
      local.add(playerId);
    }
  }
  return local;
}

function collectNameAliases(raw: string, localPlayerIds: Set<number>): Map<string, string> {
  const aliases = new Map<string, string>();
  for (const match of raw.matchAll(PLAYER_NAME_RE)) {
    const playerId = Number.parseInt(match[1] ?? '', 10);
    const name = match[2]?.trim();
    if (!name || Number.isNaN(playerId)) continue;
    aliases.set(name, localPlayerIds.has(playerId) ? 'LOCAL_PLAYER' : `OPPONENT_${playerId}`);
  }
  return aliases;
}

function sanitizeAccountIds(line: string): string {
  return line.replace(PLAYER_INFO_RE, (_match, entityId, playerId, hi) => {
    const isLocal = hi !== '0';
    const sanitizedHi = isLocal ? '1' : '0';
    const sanitizedLo = isLocal ? '1' : '0';
    return `Player EntityID=${entityId} PlayerID=${playerId} GameAccountId=[hi=${sanitizedHi} lo=${sanitizedLo}]`;
  });
}

export function sanitizePowerLog(raw: string): string {
  const localPlayerIds = collectLocalPlayerIds(raw);
  const nameAliases = collectNameAliases(raw, localPlayerIds);
  const namePatterns = [...nameAliases.entries()]
    .sort((a, b) => b[0].length - a[0].length)
    .map(([name, alias]) => [new RegExp(escapeRegExp(name), 'g'), alias] as const);

  return raw
    .split('\n')
    .map((rawLine) => {
      let line = sanitizeAccountIds(rawLine);
      for (const [pattern, alias] of namePatterns) {
        line = line.replace(pattern, alias);
      }
      return line;
    })
    .join('\n');
}

export function sanitizePowerLogFile(inputPath: string, outputPath: string): void {
  const raw = readFileSync(inputPath, 'utf8');
  writeFileSync(outputPath, sanitizePowerLog(raw));
}

if (import.meta.main) {
  const [inputPath, outputPath] = process.argv.slice(2);
  if (!inputPath || !outputPath) {
    console.error('Usage: bun scripts/sanitize-power-log.ts <input Power.log> <output fixture>');
    process.exit(1);
  }
  sanitizePowerLogFile(inputPath, outputPath);
}
