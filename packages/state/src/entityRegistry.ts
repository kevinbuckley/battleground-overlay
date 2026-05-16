export interface EntityInfo {
  cardId: string;
  zone: string;
  controller: number;
  attack?: number;
  health?: number;
  zonePos?: number;
  hasDragToBuy?: boolean;
}

export type EntityRegistry = Map<number, EntityInfo>;

import type { HsEvent } from '@overlay/log-parser';
import {
  extractEntityCardId,
  extractEntityId,
  extractEntityPlayer,
  extractEntityZonePos,
} from './entityId';

export function applyEntityEvent(registry: EntityRegistry, event: HsEvent): EntityRegistry {
  const next = new Map(registry);

  if (event.kind === 'FULL_ENTITY') {
    next.set(event.id, {
      cardId: event.cardId,
      zone: 'PLAY',
      controller: 0,
    });
    return next;
  }

  if (event.kind === 'TAG_CHANGE') {
    const entityId = extractEntityId(event.entity);
    if (entityId === null) return next;
    // Auto-create a registry entry if we haven't seen a FULL_ENTITY for this
    // id yet — TAG_CHANGEs can reveal new entities (e.g. shop refresh, summons
    // mid-combat) that we'd otherwise drop on the floor.
    // Descriptor (e.g. "[entityName=... player=3]") is on entityRaw after
    // parseTagChange normalises entity to the bare id.
    const inferredController = extractEntityPlayer(event.entityRaw ?? event.entity);
    const inferredZonePos = extractEntityZonePos(event.entityRaw ?? event.entity);
    const inferredCardId = extractEntityCardId(event.entityRaw ?? event.entity);
    const existing = next.get(entityId) ?? {
      cardId: '',
      zone: '',
      controller: inferredController ?? 0,
    };

    const updated = { ...existing };
    let changed = false;
    if (updated.controller === 0 && inferredController !== null) {
      updated.controller = inferredController;
      changed = true;
    }
    if (
      inferredZonePos !== null &&
      (inferredZonePos > 0 || updated.zonePos === undefined)
    ) {
      updated.zonePos = inferredZonePos;
      changed = true;
    }
    if (!updated.cardId && inferredCardId) {
      updated.cardId = inferredCardId;
      changed = true;
    }

    if (event.tag === 'ZONE') {
      updated.zone = event.value;
      changed = true;
    } else if (event.tag === 'CONTROLLER') {
      updated.controller = Number.parseInt(event.value, 10);
      changed = true;
    } else if (event.tag === 'CARDID') {
      updated.cardId = event.value;
      changed = true;
    } else if (event.tag === 'ATK') {
      const v = Number.parseInt(event.value, 10);
      if (!Number.isNaN(v)) {
        updated.attack = v;
        changed = true;
      }
    } else if (event.tag === 'HEALTH') {
      const v = Number.parseInt(event.value, 10);
      if (!Number.isNaN(v)) {
        updated.health = v;
        changed = true;
      }
    } else if (event.tag === 'ZONE_POSITION') {
      const v = Number.parseInt(event.value, 10);
      if (!Number.isNaN(v) && v > 0) {
        updated.zonePos = v;
        changed = true;
      }
    } else if (event.tag === 'HAS_DRAG_TO_BUY') {
      updated.hasDragToBuy = event.value === '1';
      changed = true;
    } else if (!changed) {
      return next;
    }

    next.set(entityId, updated);
    return next;
  }

  return next;
}
