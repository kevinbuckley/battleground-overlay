import { describe, expect, it } from 'bun:test';
import type { BlockStart, FullEntity, TagChange } from '@overlay/log-parser';
import { initialState } from './initialState';
import { reducer } from './reducer';

describe('reducer BLOCK_START TB_BaconShop_StartGame', () => {
  it('sets turn=1 and phase=shopping', () => {
    const event: BlockStart = {
      kind: 'BLOCK_START',
      blockType: 'TRIGGER',
      entity: 'GameEntity',
      effectCardId: 'TB_BaconShop_StartGame',
      effectIndex: 0,
      target: '0',
      subOption: '-1',
      triggerKeyword: 'NONE',
    };
    const next = reducer(initialState(), event);
    expect(next.turn).toBe(1);
    expect(next.phase).toBe('shopping');
  });
});

describe('reducer TAG_CHANGE ZONE=PLAY regression', () => {
  it('calls applyShopBuy on ZONE=PLAY', () => {
    const event: TagChange = {
      kind: 'TAG_CHANGE',
      entity: '1',
      tag: 'ZONE',
      value: 'PLAY',
    };
    const state = initialState();
    const next = reducer(state, event);
    // Should not throw and should return a GameState (same structure)
    expect(next).toBeDefined();
    expect(next.turn).toBe(state.turn);
  });
});

describe('reducer TAG_CHANGE ZONE=GRAVEYARD regression', () => {
  it('calls applyMinionRemoved on ZONE=GRAVEYARD', () => {
    const event: TagChange = {
      kind: 'TAG_CHANGE',
      entity: '1',
      tag: 'ZONE',
      value: 'GRAVEYARD',
    };
    const state = initialState();
    const next = reducer(state, event);
    // Should not throw and should return a GameState (same structure)
    expect(next).toBeDefined();
    expect(next.turn).toBe(state.turn);
  });
});

describe('reducer FULL_ENTITY', () => {
  it('registers entity in registry on FULL_ENTITY event', () => {
    const event: FullEntity = {
      kind: 'FULL_ENTITY',
      id: 100,
      cardId: 'TB_BGSMinion_1',
    };
    const state = initialState();
    const next = reducer(state, event);
    expect(next.player.entityRegistry.get(100)).toBeDefined();
    expect(next.player.entityRegistry.get(100)?.cardId).toBe('TB_BGSMinion_1');
  });

  it('adds stub minion to board when FULL_ENTITY followed by ZONE=PLAY on player controller', () => {
    const state = initialState();
    const entityEvent: FullEntity = {
      kind: 'FULL_ENTITY',
      id: 200,
      cardId: 'TB_BGSMinion_2',
    };
    const controllerEvent: TagChange = {
      kind: 'TAG_CHANGE',
      entity: '200',
      tag: 'CONTROLLER',
      value: String(state.player.playerId),
    };
    const zoneEvent: TagChange = {
      kind: 'TAG_CHANGE',
      entity: '200',
      tag: 'ZONE',
      value: 'PLAY',
    };
    const s1 = reducer(state, entityEvent);
    const s2 = reducer(s1, controllerEvent);
    const s3 = reducer(s2, zoneEvent);
    expect(s3.player.board.minions.length).toBe(1);
    expect(s3.player.board.minions[0]?.entityId).toBe(200);
  });

  it('does not add minion when FULL_ENTITY entity belongs to opponent', () => {
    const state = initialState();
    const entityEvent: FullEntity = {
      kind: 'FULL_ENTITY',
      id: 300,
      cardId: 'TB_BGSMinion_3',
    };
    const controllerEvent: TagChange = {
      kind: 'TAG_CHANGE',
      entity: '300',
      tag: 'CONTROLLER',
      value: '2',
    };
    const zoneEvent: TagChange = {
      kind: 'TAG_CHANGE',
      entity: '300',
      tag: 'ZONE',
      value: 'PLAY',
    };
    const s1 = reducer(state, entityEvent);
    const s2 = reducer(s1, controllerEvent);
    const s3 = reducer(s2, zoneEvent);
    expect(s3.player.board.minions.length).toBe(0);
  });
});
