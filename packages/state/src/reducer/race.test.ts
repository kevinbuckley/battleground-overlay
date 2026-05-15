import { describe, expect, it } from 'bun:test';
import type { TagChange } from '@overlay/log-parser';
import { initialState } from '../initialState';
import { applyRace } from './race';

function makeTagChange(entity: string, value: string): TagChange {
  return { kind: 'TAG_CHANGE', entity, tag: 'RACE', value };
}

function makePlayerMinion(
  entityId: number,
  cardId: string,
  tribes: string[] = [],
): import('@overlay/shared').Minion {
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
    tribes,
    charge: false,
    lifesteal: false,
    spellPower: 0,
    exhausted: false,
    magnetic: false,
    immune: false,
  };
}

function makeStateWithPlayerMinion(entityId: number, cardId: string, tribes: string[] = []) {
  const base = initialState();
  return {
    ...base,
    player: {
      ...base.player,
      board: {
        ...base.player.board,
        minions: [makePlayerMinion(entityId, cardId, tribes)],
      },
    },
  };
}

function makeStateWithOpponentMinion(
  oppIndex: number,
  entityId: number,
  cardId: string,
  tribes: string[] = [],
) {
  const base = initialState();
  const opp = {
    entityId: 100 + oppIndex,
    playerId: oppIndex + 1,
    hero: { entityId: 100 + oppIndex, cardId: 'TestHero', hp: 40, armor: 0 },
    board: { minions: [makePlayerMinion(entityId, cardId, tribes)] },
    tier: 3,
    eliminated: false,
    turnsPlayed: 0,
    revives: 0,
  };
  return {
    ...base,
    opponents: [opp],
  };
}

describe('applyRace', () => {
  it('sets tribes on a player board minion', () => {
    const state = makeStateWithPlayerMinion(1, 'Murloc_01', []);
    const event = makeTagChange('1', 'Murloc');
    const result = applyRace(state, event);
    expect(result.player.board.minions[0].tribes).toEqual(['Murloc']);
  });

  it('sets multiple tribes on a player board minion', () => {
    const state = makeStateWithPlayerMinion(1, 'Murloc_01', []);
    const event = makeTagChange('1', 'Beast,Murloc');
    const result = applyRace(state, event);
    expect(result.player.board.minions[0].tribes).toEqual(['Beast', 'Murloc']);
  });

  it('sets tribes on an opponent board minion', () => {
    const state = makeStateWithOpponentMinion(0, 10, 'Beast_01', []);
    const event = makeTagChange('10', 'Murloc');
    const result = applyRace(state, event);
    expect(result.opponents[0].board.minions[0].tribes).toEqual(['Murloc']);
  });

  it('is no-op on a hero entity', () => {
    const state = initialState();
    const event = makeTagChange(String(state.player.hero.entityId), 'Murloc');
    const result = applyRace(state, event);
    expect(result).toBe(state);
  });

  it('is no-op on a non-play entity', () => {
    const state = initialState();
    const event = makeTagChange('999', 'Murloc');
    const result = applyRace(state, event);
    expect(result).toBe(state);
  });
});
