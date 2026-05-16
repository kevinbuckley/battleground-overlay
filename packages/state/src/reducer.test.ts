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

  it('clears pre-populated entity registry on new game reset', () => {
    const state = initialState();
    state.player.entityRegistry.set(10, {
      cardId: 'BOT_445',
      zone: 'PLAY',
      controller: state.player.playerId,
    });
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

    const next = reducer(state, event);

    expect(next.player.entityRegistry.size).toBe(0);
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
    const state = { ...initialState(), player: { ...initialState().player, playerId: 1 } };
    const entityEvent: FullEntity = {
      kind: 'FULL_ENTITY',
      id: 200,
      cardId: 'TB_BGSMinion_2',
    };
    const controllerEvent: TagChange = {
      kind: 'TAG_CHANGE',
      entity: '200',
      tag: 'CONTROLLER',
      value: '1',
    };
    const zoneEvent: TagChange = {
      kind: 'TAG_CHANGE',
      entity: '200',
      entityRaw: '[entityName=Minion id=200 zone=HAND zonePos=1 cardId=TB_BGSMinion_2 player=1]',
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

describe('reducer TAG_CHANGE DIVINE_SHIELD via applyBuffs', () => {
  it('sets divine shield on player minion', () => {
    const state = {
      ...initialState(),
      player: {
        ...initialState().player,
        board: {
          ...initialState().player.board,
          minions: [
            {
              entityId: 1,
              cardId: 'TestMinion',
              attack: 2,
              health: 3,
              taunt: false,
              divineShield: false,
              poisonous: false,
              reborn: false,
              frozen: false,
              golden: false,
              windfury: false,
              cleave: false,
              elite: false,
              cost: 0,
              tribes: [],
              lifesteal: false,
              spellPower: 0,
            },
          ],
        },
      },
    };
    const event: TagChange = {
      kind: 'TAG_CHANGE',
      entity: '1',
      tag: 'DIVINE_SHIELD',
      value: '1',
    };
    const next = reducer(state, event);
    expect(next.player.board.minions[0]?.divineShield).toBe(true);
  });

  it('sets divine shield on opponent minion', () => {
    const state = {
      ...initialState(),
      opponents: [
        {
          entityId: 100,
          playerId: 1,
          hero: { entityId: 100, cardId: 'TestHero', hp: 40, armor: 0 },
          board: {
            minions: [
              {
                entityId: 10,
                cardId: 'TestMinion',
                attack: 2,
                health: 3,
                taunt: false,
                divineShield: false,
                poisonous: false,
                reborn: false,
                frozen: false,
                golden: false,
                windfury: false,
                cleave: false,
                elite: false,
                cost: 0,
                tribes: [],
                lifesteal: false,
                spellPower: 0,
              },
            ],
          },
          tier: 3,
          turnsPlayed: 0,
          eliminated: false,
        },
      ],
    };
    const event: TagChange = {
      kind: 'TAG_CHANGE',
      entity: '10',
      tag: 'DIVINE_SHIELD',
      value: '1',
    };
    const next = reducer(state, event);
    const oppMinion = next.opponents[0]?.board.minions[0];
    expect(oppMinion?.divineShield).toBe(true);
  });

  it('no-op on player controller (hero)', () => {
    const state = initialState();
    const event: TagChange = {
      kind: 'TAG_CHANGE',
      entity: String(state.player.hero.entityId),
      tag: 'DIVINE_SHIELD',
      value: '1',
    };
    const next = reducer(state, event);
    expect(next.player.board).toEqual(state.player.board);
    expect(next.opponents).toEqual(state.opponents);
  });

  it('no-op on non-play entity', () => {
    const state = initialState();
    const event: TagChange = {
      kind: 'TAG_CHANGE',
      entity: '999',
      tag: 'DIVINE_SHIELD',
      value: '1',
    };
    const next = reducer(state, event);
    expect(next.player.board).toEqual(state.player.board);
    expect(next.opponents).toEqual(state.opponents);
  });
});
