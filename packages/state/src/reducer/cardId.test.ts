import { describe, expect, it } from 'bun:test';
import type { TagChange } from '@overlay/log-parser';
import { initialState } from '../initialState';
import { applyCardId } from './cardId';

function makeTagChange(entity: string, value: string): TagChange {
  return { kind: 'TAG_CHANGE', entity, tag: 'CARDID', value };
}

function makePlayerMinion(entityId: number, cardId: string): import('@overlay/shared').Minion {
  return {
    entityId,
    cardId,
    attack: 1,
    health: 1,
    taunt: false,
    divineShield: false,
    poisonous: false,
    reborn: false,
    frozen: false,
    golden: false,
    windfury: false,
    cleave: false,
    elite: false,
    cost: 1,
    tribes: [],
  };
}

function makeStateWithPlayerMinion(entityId: number, cardId: string) {
  const base = initialState();
  const registry = new Map(base.player.entityRegistry);
  registry.set(entityId, { cardId, zone: 'PLAY', controller: base.player.playerId });
  return {
    ...base,
    player: {
      ...base.player,
      board: {
        ...base.player.board,
        minions: [makePlayerMinion(entityId, cardId)],
      },
      entityRegistry: registry,
    },
  };
}

function makeStateWithOpponentMinion(oppIndex: number, entityId: number, cardId: string) {
  const base = initialState();
  const registry = new Map(base.player.entityRegistry);
  registry.set(entityId, { cardId, zone: 'PLAY', controller: oppIndex + 1 });
  const opp = {
    entityId: 100 + oppIndex,
    playerId: oppIndex + 1,
    hero: { entityId: 100 + oppIndex, cardId: 'TestHero', hp: 40, armor: 0 },
    board: { minions: [makePlayerMinion(entityId, cardId)] },
    tier: 3,
    eliminated: false,
  };
  return {
    ...base,
    player: { ...base.player, entityRegistry: registry },
    opponents: [opp],
  };
}

describe('applyCardId', () => {
  it('updates cardId on a player board minion', () => {
    const state = makeStateWithPlayerMinion(1, 'Old_Card');
    const event = makeTagChange('1', 'New_Card_v2');
    const result = applyCardId(state, event);
    expect(result.player.board.minions[0].cardId).toBe('New_Card_v2');
    expect(result.player.entityRegistry.get(1)?.cardId).toBe('New_Card_v2');
  });

  it('updates cardId on an opponent board minion', () => {
    const state = makeStateWithOpponentMinion(0, 10, 'Old_Opp_Card');
    const event = makeTagChange('10', 'New_Opp_Card');
    const result = applyCardId(state, event);
    expect(result.opponents[0].board.minions[0].cardId).toBe('New_Opp_Card');
    expect(result.opponents[0].entityId).toBe(100);
  });

  it('is no-op on a hero entity', () => {
    const state = initialState();
    const event = makeTagChange(String(state.player.hero.entityId), 'Some_Card');
    const result = applyCardId(state, event);
    expect(result).toBe(state);
  });

  it('is no-op on a non-play entity', () => {
    const state = initialState();
    const event = makeTagChange('999', 'Some_Card');
    const result = applyCardId(state, event);
    expect(result).toBe(state);
  });
});
