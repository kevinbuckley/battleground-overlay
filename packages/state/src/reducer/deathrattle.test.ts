import { describe, expect, it } from 'bun:test';
import type { BlockStart } from '@overlay/log-parser';
import { initialState } from '../initialState';
import { applyDeathrattle } from './deathrattle';

function makeBlockStart(
  entity: string,
  triggerKeyword: string,
  target = 'HAND',
  effectCardId = 'TB_BaconShop_StartGame',
): BlockStart {
  return {
    kind: 'BLOCK_START',
    blockType: 'TRIGGER',
    entity,
    target,
    triggerKeyword,
    effectCardId,
    subOption: '',
    effectIndex: 0,
  };
}

function buildStateWithBoard(
  playerId: number,
  cardIds: [number, string][],
): ReturnType<typeof initialState> {
  const state = initialState();
  state.player.playerId = playerId;
  state.player.entityId = playerId;

  const registry = new Map(state.player.entityRegistry);
  const minions = [];
  for (const [id, cardId] of cardIds) {
    registry.set(id, { cardId, zone: 'PLAY', controller: playerId });
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

describe('applyDeathrattle', () => {
  it('adds a deathrattle minion to hand when target is HAND', () => {
    const state = buildStateWithBoard(1, [[100, 'TB_BGSMinion_Deathrattle']]);
    expect(state.player.board.minions.length).toBe(1);
    expect(state.player.hand.length).toBe(0);

    const deathrattleEvent = makeBlockStart('100', 'DEATHRATTLE: Add a minion');
    const next = applyDeathrattle(state, deathrattleEvent);

    expect(next.player.hand.length).toBe(1);
    const handEntityId = next.player.hand[0];
    const spawnedInfo = next.player.entityRegistry.get(handEntityId as number);
    expect(spawnedInfo).toBeDefined();
    if (!spawnedInfo) throw new Error('expected spawned info');
    expect(spawnedInfo.cardId).toBe('TB_BGSMinion_Deathrattle');
  });

  it('adds a deathrattle minion to board when target is PLAY', () => {
    const state = buildStateWithBoard(1, [[100, 'TB_BGSMinion_Reborn']]);
    expect(state.player.board.minions.length).toBe(1);

    const deathrattleEvent = makeBlockStart('100', 'Reborn', 'PLAY');
    const next = applyDeathrattle(state, deathrattleEvent);

    expect(next.player.board.minions.length).toBe(2);
    const spawned = next.player.board.minions.find((m) => m.entityId > 1000000);
    expect(spawned).toBeDefined();
    if (!spawned) throw new Error('expected spawned minion');
    expect(spawned.cardId).toBe('TB_BGSMinion_Reborn');
  });

  it('does nothing for non-TRIGGER block types', () => {
    const state = buildStateWithBoard(1, [[100, 'TB_BGSMinion_1']]);
    const nonTriggerEvent = makeBlockStart('100', 'Some other trigger', 'HAND');
    (nonTriggerEvent as unknown as Record<string, string>).blockType = 'OTHER';
    const next = applyDeathrattle(state, nonTriggerEvent);

    expect(next.player.board.minions.length).toBe(1);
    expect(next.player.hand.length).toBe(0);
  });

  it('does nothing for non-deathrattle TRIGGER blocks', () => {
    const state = buildStateWithBoard(1, [[100, 'TB_BGSMinion_1']]);
    const normalTrigger = makeBlockStart('100', 'Hero Power');
    const next = applyDeathrattle(state, normalTrigger);

    expect(next.player.board.minions.length).toBe(1);
    expect(next.player.hand.length).toBe(0);
  });

  it('does nothing if entity is not on player board', () => {
    const state = initialState();
    state.player.playerId = 1;
    state.player.entityId = 1;
    state.player.entityRegistry.set(100, {
      cardId: 'TB_BGSMinion_1',
      zone: 'HAND',
      controller: 1,
    });

    const deathrattleEvent = makeBlockStart('100', 'DEATHRATTLE: Add a minion');
    const next = applyDeathrattle(state, deathrattleEvent);

    expect(next.player.board.minions.length).toBe(0);
    expect(next.player.hand.length).toBe(0);
  });

  it('does nothing if entity belongs to opponent', () => {
    const state = buildStateWithBoard(1, [[100, 'TB_BGSMinion_1']]);
    state.player.entityRegistry.set(100, {
      cardId: 'TB_BGSMinion_1',
      zone: 'PLAY',
      controller: 2,
    });

    const deathrattleEvent = makeBlockStart('100', 'DEATHRATTLE: Add a minion');
    const next = applyDeathrattle(state, deathrattleEvent);

    expect(next.player.board.minions.length).toBe(1);
    expect(next.player.hand.length).toBe(0);
  });
});
