import type { PlayerInfo } from './types';

// Matches lines like:
//   Player EntityID=8 PlayerID=3 GameAccountId=[hi=144115193835963207 lo=52421247]
const PLAYER_RE =
  /^Player\s+EntityID=(\d+)\s+PlayerID=(\d+)\s+GameAccountId=\[hi=(-?\d+)\s+lo=(-?\d+)\]/;

export function parsePlayerInfo(line: string): PlayerInfo | null {
  const m = PLAYER_RE.exec(line.trim());
  if (!m) return null;
  const [, eid, pid, hi] = m;
  if (!eid || !pid || hi === undefined) return null;
  return {
    kind: 'PLAYER_INFO',
    entityId: Number.parseInt(eid, 10),
    playerId: Number.parseInt(pid, 10),
    isLocal: hi !== '0',
  };
}
