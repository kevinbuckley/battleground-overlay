import { describe, expect, it } from 'bun:test';
import type { TagChange } from '@overlay/log-parser';
import { initialState } from '../initialState';
import { applySpellPower } from './spellPower';

function makeTagChange(entity: string, tag: string, value: string): TagChange {
  return { kind: 'TAG_CHANGE', entity, tag, value };
}

function makePlayerMinion(
  entityId: number,
  cardId: string,
  attack: number,
  health: number,
  spellPower = 0,
) {
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
    lifesteal: false,
    cost: 0,
    tribes: [],
    charge: false,
    spellPower,
  };
}

function makeStateWithPlayerMinion(
  entityId: number,
  attack: number,
  health: number,
  spellPower = 0,
) {
  const base = initialState();
  return {
    ...base,
    player: {
      ...base.player,
      board: {
        ...base.player.board,
        minions: [makePlayerMinion(entityId, 'TestMinion', attack, health, spellPower)],
      },
    },
  };
}

function makeStateWithOpponentMinion(
  oppIndex: number,
  entityId: number,
  attack: number,
  health: number,
  spellPower = 0,
) {
  const base = initialState();
  const opp = {
    entityId: 100 + oppIndex,
    playerId: oppIndex + 1,
    hero: { entityId: 100 + oppIndex, cardId: 'TestHero', hp: 40, armor: 0 },
    board: { minions: [makePlayerMinion(entityId, 'TestMinion', attack, health, spellPower)] },
    tier: 3,
    eliminated: false,
    turnsPlayed: 0,
  };
  return {
    ...base,
    opponents: [opp],
  };
}

describe('applySpellPower', () => {
  it('updates player board minion spellPower', () => {
    const state = makeStateWithPlayerMinion(1, 2, 3, 0);
    const event = makeTagChange('1', 'SPELL_POWER', '2');
    const result = applySpellPower(state, event);
    expect(result.player.board.minions[0].spellPower).toBe(2);
  });

  it('updates opponent board minion spellPower', () => {
    const state = makeStateWithOpponentMinion(0, 10, 2, 3, 0);
    const event = makeTagChange('10', 'SPELL_POWER', '3');
    const result = applySpellPower(state, event);
    expect(result.opponents[0].board.minions[0].spellPower).toBe(3);
  });

  it('no-op on hero (entity not on any board)', () => {
    const state = initialState();
    const event = makeTagChange(String(state.player.hero.entityId), 'SPELL_POWER', '5');
    const result = applySpellPower(state, event);
    expect(result).toBe(state);
  });

  it('no-op on non-play entity (entity not found on any board)', () => {
    const state = initialState();
    const event = makeTagChange('999', 'SPELL_POWER', '5');
    const result = applySpellPower(state, event);
    expect(result).toBe(state);
  });
});
