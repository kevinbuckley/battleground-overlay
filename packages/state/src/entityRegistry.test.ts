import { describe, expect, it } from 'bun:test';
import type { FullEntity, TagChange } from '@overlay/log-parser';
import { type EntityInfo, type EntityRegistry, applyEntityEvent } from './entityRegistry';

function makeFullEntity(id: number, cardId: string): FullEntity {
  return { kind: 'FULL_ENTITY', id, cardId };
}

function makeTagChange(entityId: number, tag: string, value: string): TagChange {
  return { kind: 'TAG_CHANGE', entity: String(entityId), tag, value };
}

describe('entityRegistry', () => {
  it('inserts a new entity on FULL_ENTITY event', () => {
    const registry: EntityRegistry = new Map();
    const event = makeFullEntity(1, 'TB_BGSMinion_1');
    const next = applyEntityEvent(registry, event);

    expect(next.size).toBe(1);
    expect(next.get(1)).toEqual<EntityInfo>({
      cardId: 'TB_BGSMinion_1',
      zone: 'PLAY',
      controller: 0,
    });
  });

  it('updates zone, controller, and cardId on TAG_CHANGE', () => {
    const registry: EntityRegistry = new Map();
    const insert = makeFullEntity(42, 'TB_BGSMinion_42');
    let next = applyEntityEvent(registry, insert);

    // Update zone
    const zoneEvent = makeTagChange(42, 'ZONE', 'GRAVEYARD');
    next = applyEntityEvent(next, zoneEvent);
    expect(next.get(42)?.zone).toBe('GRAVEYARD');

    // Update controller
    const controllerEvent = makeTagChange(42, 'CONTROLLER', '1');
    next = applyEntityEvent(next, controllerEvent);
    expect(next.get(42)?.controller).toBe(1);

    // Update cardId
    const cardIdEvent = makeTagChange(42, 'CARDID', 'TB_BGSMinion_99');
    next = applyEntityEvent(next, cardIdEvent);
    expect(next.get(42)?.cardId).toBe('TB_BGSMinion_99');
  });

  it('auto-creates an entry for unknown entity TAG_CHANGE', () => {
    const registry: EntityRegistry = new Map();
    registry.set(1, { cardId: 'TB_BGSMinion_1', zone: 'PLAY', controller: 0 });

    const unknownEvent = makeTagChange(999, 'ZONE', 'GRAVEYARD');
    const next = applyEntityEvent(registry, unknownEvent);

    expect(next.size).toBe(2);
    expect(next.get(999)).toEqual({ cardId: '', zone: 'GRAVEYARD', controller: 0 });
  });
});
