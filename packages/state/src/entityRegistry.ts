export interface EntityInfo {
  cardId: string;
  zone: string;
  controller: number;
}

export type EntityRegistry = Map<number, EntityInfo>;

import type { HsEvent } from '@overlay/log-parser';

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
    const entityMatch = event.entity.match(/^(\d+)$/);
    if (!entityMatch || !entityMatch[1]) return next;

    const entityId = Number.parseInt(entityMatch[1], 10);
    const existing = next.get(entityId);
    if (!existing) return next;

    const updated = { ...existing };

    if (event.tag === 'ZONE') {
      updated.zone = event.value;
    } else if (event.tag === 'CONTROLLER') {
      updated.controller = Number.parseInt(event.value, 10);
    } else if (event.tag === 'CARDID') {
      updated.cardId = event.value;
    } else {
      return next;
    }

    next.set(entityId, updated);
    return next;
  }

  return next;
}
