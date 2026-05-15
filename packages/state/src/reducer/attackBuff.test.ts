import { describe, expect, it } from 'bun:test';
import type { TagChange } from '@overlay/log-parser';
import { initialState } from '../initialState';
import { applyAttackBuff } from './attackBuff';

function makeTagChange(entity: string, tag: string, value: string): TagChange {
  return { kind: 'TAG_CHANGE', entity, tag, value };
}

function makePlayerMinion(entityId: number, cardId: string, attack: number, health: number) {
  return {
    entityId,
    cardId,
    attack,
    health,
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
    charge: false,
  };
}

function makeStateWithPlayerMinion(entityId: number, attack: number, health: number) {
  const base = initialState();
  return {
    ...base,
    player: {
      ...base.player,
      board: {
        ...base.player.board,
        minions: [makePlayerMinion(entityId, 'TestMinion', attack, health)],
      },
    },
  };
}

function makeStateWithOpponentMinion(
  oppIndex: number,
  entityId: number,
  attack: number,
  health: number,
) {
  const base = initialState();
  const opp = {
    entityId: 100 + oppIndex,
    playerId: oppIndex + 1,
    hero: { entityId: 100 + oppIndex, cardId: 'TestHero', hp: 40, armor: 0 },
    board: {
      minions: [makePlayerMinion(entityId, 'OppMinion', attack, health)],
    },
    tier: 3,
    eliminated: false,
  };
  return {
    ...base,
    opponents: [opp],
  };
}

describe('applyAttackBuff', () => {
  it('updates player board minion attack', () => {
    const state = makeStateWithPlayerMinion(1, 2, 3);
    const event = makeTagChange('1', 'ATK', '5');
    const result = applyAttackBuff(state, event);
    expect(result.player.board.minions[0].attack).toBe(5);
  });

  it('updates opponent board minion attack', () => {
    const state = makeStateWithOpponentMinion(0, 101, 3, 4);
    const event = makeTagChange('101', 'ATK', '7');
    const result = applyAttackBuff(state, event);
    expect(result.opponents[0].board.minions[0].attack).toBe(7);
  });

  it('no-op on hero entity', () => {
    const state = initialState();
    const event = makeTagChange(String(state.player.entityId), 'ATK', '10');
    const result = applyAttackBuff(state, event);
    expect(result).toBe(state);
  });

  it('no-op when entityId not on any board', () => {
    const state = initialState();
    const event = makeTagChange('99999', 'ATK', '10');
    const result = applyAttackBuff(state, event);
    expect(result).toBe(state);
  });
});
