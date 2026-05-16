import type { PlayerName } from './types';

// Matches lines like:
//   PlayerID=3, PlayerName=kbux#11815
const PLAYER_NAME_RE = /^PlayerID=(\d+),\s*PlayerName=(.+?)\s*$/;

export function parsePlayerName(line: string): PlayerName | null {
  const m = PLAYER_NAME_RE.exec(line.trim());
  if (!m) return null;
  const [, pid, name] = m;
  if (!pid || !name) return null;
  return { kind: 'PLAYER_NAME', playerId: Number.parseInt(pid, 10), name };
}
