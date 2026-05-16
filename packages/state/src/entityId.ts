// HS Power.log TAG_CHANGE entity fields come in two shapes:
//   1. Bare numeric:        "19"
//   2. Descriptor bracket:  "[entityName=Foo id=289 zone=PLAY zonePos=3 cardId=ABC player=11]"
// Return the numeric entity id from either form, or null if not extractable.
export function extractEntityId(entity: string): number | null {
  const bare = entity.match(/^(\d+)$/);
  if (bare?.[1]) return Number.parseInt(bare[1], 10);
  const bracket = entity.match(/\bid=(\d+)\b/);
  if (bracket?.[1]) return Number.parseInt(bracket[1], 10);
  return null;
}

// Some descriptor forms also embed the controller as `player=N`. Useful when
// we want to know ownership before the CONTROLLER tag-change is processed.
export function extractEntityPlayer(entity: string): number | null {
  const m = entity.match(/\bplayer=(\d+)\b/);
  if (m?.[1]) return Number.parseInt(m[1], 10);
  return null;
}

// Descriptor includes the entity's PRIOR zone (e.g. `zone=HAND`) before the
// transition this TAG_CHANGE describes. Returns null if not present.
export function extractEntityPriorZone(entity: string): string | null {
  const m = entity.match(/\bzone=([A-Z_]+)\b/);
  return m?.[1] ?? null;
}

export function extractEntityZonePos(entity: string): number | null {
  const m = entity.match(/\bzonePos=(\d+)\b/);
  if (!m?.[1]) return null;
  return Number.parseInt(m[1], 10);
}

export function extractEntityCardId(entity: string): string | null {
  const m = entity.match(/\bcardId=([^\]\s]*)/);
  if (!m?.[1]) return null;
  return m[1];
}

// Returns true if the TAG_CHANGE entity refers to the local player. HS uses
// any of three forms:
//   - bare numeric matching player.entityId
//   - descriptor like "[... player=<playerId> ...]"
//   - the player's Battle.net tag (e.g. "kbux#11815") for some player-level tags
import type { GameState } from '@overlay/shared';
export function entityRefersToPlayer(entity: string, state: GameState): boolean {
  if (/^\d+$/.test(entity)) {
    return Number.parseInt(entity, 10) === state.player.entityId;
  }
  if (state.player.name && entity === state.player.name) return true;
  const id = extractEntityId(entity);
  if (id !== null && id === state.player.entityId) return true;
  const owner = extractEntityPlayer(entity);
  return owner !== null && owner === state.player.playerId;
}
