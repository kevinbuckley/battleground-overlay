import { describe, expect, it } from 'bun:test';
import type { FullEntity, TagChange } from '@overlay/log-parser';
import { applyEntityEvent } from '../entityRegistry';
import { initialState } from '../initialState';
import { applyMinionRemoved } from './minionRemoved';

function makeFullEntity(id: number, cardId: string): FullEntity {
  return { kind: 'FULL_ENTITY', id, cardId };
}

function makeTagChange(entityId: number, tag: string, value: string): TagChange {
  return { kind: 'TAG_CHANGE', entity: String(entityId), tag, value };
}

function buildStateWithBoard(
  playerId: number,
  cardIds: [number, string][],
): ReturnType<typeof initialState> {
  const state = initialState();
  state.player.playerId = playerId;
  state.player.entityId = playerId;

  // Build registry and add stub minions to the board
  let registry = new Map(state.player.entityRegistry);
  const minions = [];
  for (const [id, cardId] of cardIds) {
    registry = applyEntityEvent(registry, makeFullEntity(id, cardId));
    // Set controller to player so minionRemoved will actually remove it
    registry = applyEntityEvent(registry, makeTagChange(id, 'CONTROLLER', String(playerId)));
    minions.push({
      entityId: id,
      cardId,
      attack: 0,
      health: 0,
      taunt: false,
      divineShield: false,
      poisonous: false,
      reborn: false,
      frozen: false,
      tribes: [],
    });
  }
  state.player.entityRegistry = registry;
  state.player.board.minions = minions;
  return state;
}

describe('minionRemoved', () => {
  it('removes a minion from player board when entity transitions to GRAVEYARD', () => {
    const state = buildStateWithBoard(1, [
      [100, 'TB_BGSMinion_1'],
      [200, 'TB_BGSMinion_2'],
    ]);
    expect(state.player.board.minions.length).toBe(2);

    const graveEvent = makeTagChange(100, 'ZONE', 'GRAVEYARD');
    const next = applyMinionRemoved(state, graveEvent);

    expect(next.player.board.minions.length).toBe(1);
    const remaining = next.player.board.minions[0];
    if (!remaining) throw new Error('expected minion');
    expect(remaining.entityId).toBe(200);
  });

  it('removes a minion when entity transitions to REMOVEDFROMGAME', () => {
    const state = buildStateWithBoard(1, [[300, 'TB_BGSMinion_3']]);
    expect(state.player.board.minions.length).toBe(1);

    const removedEvent = makeTagChange(300, 'ZONE', 'REMOVEDFROMGAME');
    const next = applyMinionRemoved(state, removedEvent);

    expect(next.player.board.minions.length).toBe(0);
  });

  it('does not remove minion if entity belongs to opponent', () => {
    const state = initialState();
    state.player.playerId = 1;
    state.player.entityId = 1;

    // Build registry with controller=2 (opponent)
    let registry = new Map(state.player.entityRegistry);
    registry = applyEntityEvent(registry, makeFullEntity(100, 'TB_BGSMinion_1'));
    registry = applyEntityEvent(registry, makeTagChange(100, 'CONTROLLER', '2'));
    state.player.entityRegistry = registry;
    state.player.board.minions = [
      {
        entityId: 100,
        cardId: 'TB_BGSMinion_1',
        attack: 0,
        health: 0,
        taunt: false,
        divineShield: false,
        poisonous: false,
        reborn: false,
        frozen: false,
        tribes: [],
      },
    ];

    const graveEvent = makeTagChange(100, 'ZONE', 'GRAVEYARD');
    const next = applyMinionRemoved(state, graveEvent);

    expect(next.player.board.minions.length).toBe(1);
  });

  it('does nothing for non-ZONE tag changes', () => {
    const state = buildStateWithBoard(1, [[100, 'TB_BGSMinion_1']]);
    const attackEvent = makeTagChange(100, 'ATK', '3');
    const next = applyMinionRemoved(state, attackEvent);

    expect(next.player.board.minions.length).toBe(1);
  });

  it('does nothing for non-GRAVEYARD/REMOVEDFROMGAME zone transitions', () => {
    const state = buildStateWithBoard(1, [[100, 'TB_BGSMinion_1']]);
    const shopEvent = makeTagChange(100, 'ZONE', 'SHOP');
    const next = applyMinionRemoved(state, shopEvent);

    expect(next.player.board.minions.length).toBe(1);
  });

  it('does nothing if entity is not on the board', () => {
    const state = buildStateWithBoard(1, [[100, 'TB_BGSMinion_1']]);
    // Remove the minion from board manually
    state.player.board.minions = [];

    const graveEvent = makeTagChange(100, 'ZONE', 'GRAVEYARD');
    const next = applyMinionRemoved(state, graveEvent);

    expect(next.player.board.minions.length).toBe(0);
  });
});
