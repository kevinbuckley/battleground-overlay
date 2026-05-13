import { describe, expect, it } from 'bun:test';
import type { TagChange } from '@overlay/log-parser';
import { initialState } from '../initialState';
import { applyBuffs } from './buffs';

function makeTagChange(entity: string, tag: string, value: string): TagChange {
  return { kind: 'TAG_CHANGE', entity, tag, value };
}

function makePlayerMinion(
  entityId: number,
  cardId: string,
  attack: number,
  health: number,
): import('@overlay/shared').Minion {
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
    board: { minions: [makePlayerMinion(entityId, 'TestMinion', attack, health)] },
    tier: 3,
    eliminated: false,
  };
  return {
    ...base,
    opponents: [opp],
  };
}

describe('applyBuffs', () => {
  it('divine shield on on player minion', () => {
    const state = makeStateWithPlayerMinion(1, 2, 3);
    const event = makeTagChange('1', 'DIVINE_SHIELD', '1');
    const result = applyBuffs(state, event);
    expect(result.player.board.minions[0].divineShield).toBe(true);
  });

  it('divine shield off on player minion', () => {
    const state = makeStateWithPlayerMinion(1, 2, 3);
    const stateWithShield = {
      ...state,
      player: {
        ...state.player,
        board: {
          ...state.player.board,
          minions: [{ ...state.player.board.minions[0], divineShield: true }],
        },
      },
    };
    const event = makeTagChange('1', 'DIVINE_SHIELD', '0');
    const result = applyBuffs(stateWithShield, event);
    expect(result.player.board.minions[0].divineShield).toBe(false);
  });

  it('divine shield on on opponent minion', () => {
    const state = makeStateWithOpponentMinion(0, 10, 2, 3);
    const event = makeTagChange('10', 'DIVINE_SHIELD', '1');
    const result = applyBuffs(state, event);
    expect(result.opponents[0].board.minions[0].divineShield).toBe(true);
  });

  it('no-op on non-play entity', () => {
    const state = initialState();
    const event = makeTagChange('999', 'DIVINE_SHIELD', '1');
    const result = applyBuffs(state, event);
    expect(result).toBe(state);
  });

  it('no-op on hero', () => {
    const state = initialState();
    const event = makeTagChange(String(state.player.hero.entityId), 'DIVINE_SHIELD', '1');
    const result = applyBuffs(state, event);
    expect(result).toBe(state);
  });

  it('no-op on unknown tag', () => {
    const state = makeStateWithPlayerMinion(1, 3, 4);
    const event = makeTagChange('1', 'UNKNOWN_TAG', '10');
    const result = applyBuffs(state, event);
    expect(result).toBe(state);
  });
});
