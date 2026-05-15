import { describe, expect, it } from 'bun:test';
import type { FullEntity, TagChange } from '@overlay/log-parser';
import { applyEntityEvent } from '../entityRegistry';
import { initialState } from '../initialState';
import { applyMinionPlaced } from './minionPlaced';

function makeFullEntity(id: number, cardId: string): FullEntity {
  return { kind: 'FULL_ENTITY', id, cardId };
}

function makeTagChange(entityId: number, tag: string, value: string): TagChange {
  return { kind: 'TAG_CHANGE', entity: String(entityId), tag, value };
}

function buildStateWithRegistry(
  playerId: number,
  cardIds: [number, string][],
): ReturnType<typeof initialState> {
  const state = initialState();
  state.player.playerId = playerId;
  state.player.entityId = playerId;
  let registry = new Map(state.player.entityRegistry);
  for (const [id, cardId] of cardIds) {
    registry = applyEntityEvent(registry, makeFullEntity(id, cardId));
  }
  state.player.entityRegistry = registry;
  return state;
}

describe('minionPlaced', () => {
  it('adds a stub Minion to player board when entity transitions to PLAY on player controller', () => {
    const state = buildStateWithRegistry(1, [[100, 'TB_BGSMinion_1']]);
    // Set controller to player's ID
    const controllerEvent = makeTagChange(100, 'CONTROLLER', '1');
    const s = applyMinionPlaced(state, controllerEvent);
    // Now transition to PLAY
    const zoneEvent = makeTagChange(100, 'ZONE', 'PLAY');
    const next = applyMinionPlaced(s, zoneEvent);

    expect(next.player.board.minions.length).toBe(1);
    const m = next.player.board.minions[0];
    if (!m) throw new Error('expected minion');
    expect(m.entityId).toBe(100);
    expect(m.cardId).toBe('TB_BGSMinion_1');
    expect(m.attack).toBe(0);
    expect(m.health).toBe(0);
  });

  it('does not add minion if entity belongs to opponent controller', () => {
    const state = buildStateWithRegistry(1, [[200, 'TB_BGSMinion_2']]);
    const controllerEvent = makeTagChange(200, 'CONTROLLER', '2');
    const zoneEvent = makeTagChange(200, 'ZONE', 'PLAY');
    const s = applyMinionPlaced(state, controllerEvent);
    const next = applyMinionPlaced(s, zoneEvent);

    expect(next.player.board.minions.length).toBe(0);
  });

  it('does not add duplicate minion if already on board', () => {
    const state = buildStateWithRegistry(1, [[300, 'TB_BGSMinion_3']]);
    const controllerEvent = makeTagChange(300, 'CONTROLLER', '1');
    const s0 = applyMinionPlaced(state, controllerEvent);
    const zoneEvent = makeTagChange(300, 'ZONE', 'PLAY');
    const s1 = applyMinionPlaced(s0, zoneEvent);
    expect(s1.player.board.minions.length).toBe(1);

    const graveEvent = makeTagChange(300, 'ZONE', 'GRAVEYARD');
    const s2 = applyMinionPlaced(s1, graveEvent);
    expect(s2.player.board.minions.length).toBe(1);

    const backToPlay = makeTagChange(300, 'ZONE', 'PLAY');
    const s3 = applyMinionPlaced(s2, backToPlay);
    expect(s3.player.board.minions.length).toBe(1);
  });

  it('ignores non-ZONE tag changes', () => {
    const state = buildStateWithRegistry(1, [[400, 'TB_BGSMinion_4']]);
    const attackEvent = makeTagChange(400, 'ATK', '3');
    const next = applyMinionPlaced(state, attackEvent);

    expect(next.player.board.minions.length).toBe(0);
  });

  it('ignores non-PLAY zone transitions', () => {
    const state = buildStateWithRegistry(1, [[500, 'TB_BGSMinion_5']]);
    const graveEvent = makeTagChange(500, 'ZONE', 'GRAVEYARD');
    const next = applyMinionPlaced(state, graveEvent);

    expect(next.player.board.minions.length).toBe(0);
  });

  it('stores FULL_ENTITY details in the player entity registry', () => {
    const state = initialState();
    const next = applyMinionPlaced(state, makeFullEntity(10, 'BOT_445'));

    expect(next.player.entityRegistry.get(10)).toBeDefined();
  });

  it('preserves the FULL_ENTITY cardId in the player entity registry', () => {
    const state = initialState();
    const next = applyMinionPlaced(state, makeFullEntity(11, 'BOT_445'));

    expect(next.player.entityRegistry.get(11)?.cardId).toBe('BOT_445');
  });

  it('updates existing entity registry entries when the same id is placed twice', () => {
    const state = initialState();
    const first = applyMinionPlaced(state, makeFullEntity(12, 'BOT_445'));
    const second = applyMinionPlaced(first, makeFullEntity(12, 'TB_BGSMinion_7'));

    expect(second.player.entityRegistry.get(12)?.cardId).toBe('TB_BGSMinion_7');
  });
});
