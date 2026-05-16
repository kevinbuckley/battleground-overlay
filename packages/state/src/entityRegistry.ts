export interface EntityInfo {
  cardId: string;
  zone: string;
  controller: number;
  attack?: number;
  health?: number;
}

export type EntityRegistry = Map<number, EntityInfo>;

import type { HsEvent } from '@overlay/log-parser';
import { extractEntityId, extractEntityPlayer } from './entityId';

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
    const existing = next.get(entityId) ?? {
      cardId: '',
      zone: '',
      controller: inferredController ?? 0,
    };

    const updated = { ...existing };

    if (event.tag === 'ZONE') {
      updated.zone = event.value;
    } else if (event.tag === 'CONTROLLER') {
      updated.controller = Number.parseInt(event.value, 10);
    } else if (event.tag === 'CARDID') {
      updated.cardId = event.value;
    } else if (event.tag === 'ATK') {
      const v = Number.parseInt(event.value, 10);
      if (!Number.isNaN(v)) updated.attack = v;
    } else if (event.tag === 'HEALTH') {
      const v = Number.parseInt(event.value, 10);
      if (!Number.isNaN(v)) updated.health = v;
    } else {
      return next;
    }

    next.set(entityId, updated);
    return next;
  }

  return next;
}
