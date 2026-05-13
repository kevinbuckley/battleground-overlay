import { describe, expect, it } from 'bun:test';
import type { TagChange } from '@overlay/log-parser';
import { initialState } from '../initialState';
import { applyElite } from './elite';

function makeTagChange(entity: string, tag: string, value: string): TagChange {
  return { kind: 'TAG_CHANGE', entity, tag, value };
}

function makePlayerMinion(
  entityId: number,
  cardId: string,
  attack: number,
  health: number,
  elite = false,
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
    elite,
    tribes: [],
  };
}

function makeStateWithPlayerMinion(
  entityId: number,
  attack: number,
  health: number,
  elite = false,
) {
  const base = initialState();
  return {
    ...base,
    player: {
      ...base.player,
      board: {
        ...base.player.board,
        minions: [makePlayerMinion(entityId, 'TestMinion', attack, health, elite)],
      },
    },
  };
}

function makeStateWithOpponentMinion(
  oppIndex: number,
  entityId: number,
  attack: number,
  health: number,
  elite = false,
) {
  const base = initialState();
  const opp = {
    entityId: 100 + oppIndex,
    playerId: oppIndex + 1,
    hero: { entityId: 100 + oppIndex, cardId: 'TestHero', hp: 40, armor: 0 },
    board: { minions: [makePlayerMinion(entityId, 'TestMinion', attack, health, elite)] },
    tier: 3,
    eliminated: false,
  };
  return {
    ...base,
    opponents: [opp],
  };
}

describe('applyElite', () => {
  it('sets elite on player minion when value=1', () => {
    const state = makeStateWithPlayerMinion(1, 2, 3, false);
    const event = makeTagChange('1', 'ELITE', '1');
    const result = applyElite(state, event);
    expect(result.player.board.minions[0].elite).toBe(true);
  });

  it('clears elite on player minion when value=0', () => {
    const state = makeStateWithPlayerMinion(2, 4, 4, true);
    const event = makeTagChange('2', 'ELITE', '0');
    const result = applyElite(state, event);
    expect(result.player.board.minions[0].elite).toBe(false);
  });

  it('no-op on hero (entity not on any board)', () => {
    const state = initialState();
    const event = makeTagChange(String(state.player.hero.entityId), 'ELITE', '1');
    const result = applyElite(state, event);
    expect(result).toBe(state);
  });

  it('no-op on non-play entity (entity not found on any board)', () => {
    const state = initialState();
    const event = makeTagChange('999', 'ELITE', '1');
    const result = applyElite(state, event);
    expect(result).toBe(state);
  });

  it('sets elite on opponent minion when value=1', () => {
    const state = makeStateWithOpponentMinion(0, 10, 2, 3, false);
    const event = makeTagChange('10', 'ELITE', '1');
    const result = applyElite(state, event);
    expect(result.opponents[0].board.minions[0].elite).toBe(true);
  });
});
