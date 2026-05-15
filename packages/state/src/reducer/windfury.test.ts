import { describe, expect, it } from 'bun:test';
import type { TagChange } from '@overlay/log-parser';
import { initialState } from '../initialState';
import { applyWindfury } from './windfury';

function makeTagChange(entity: string, tag: string, value: string): TagChange {
  return { kind: 'TAG_CHANGE', entity, tag, value };
}

function makePlayerMinion(
  entityId: number,
  cardId: string,
  attack: number,
  health: number,
  windfury = false,
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
    windfury,
    cleave: false,
    tribes: [],
    charge: false,
  };
}

function makeStateWithPlayerMinion(
  entityId: number,
  attack: number,
  health: number,
  windfury = false,
) {
  const base = initialState();
  return {
    ...base,
    player: {
      ...base.player,
      board: {
        ...base.player.board,
        minions: [makePlayerMinion(entityId, 'TestMinion', attack, health, windfury)],
      },
    },
  };
}

function makeStateWithOpponentMinion(
  oppIndex: number,
  entityId: number,
  attack: number,
  health: number,
  windfury = false,
) {
  const base = initialState();
  const opp = {
    entityId: 100 + oppIndex,
    playerId: oppIndex + 1,
    hero: { entityId: 100 + oppIndex, cardId: 'TestHero', hp: 40, armor: 0 },
    board: { minions: [makePlayerMinion(entityId, 'TestMinion', attack, health, windfury)] },
    tier: 3,
    eliminated: false,
  };
  return {
    ...base,
    opponents: [opp],
  };
}

describe('applyWindfury', () => {
  it('sets windfury on player minion when value=1', () => {
    const state = makeStateWithPlayerMinion(1, 2, 3, false);
    const event = makeTagChange('1', 'WINDFURY', '1');
    const result = applyWindfury(state, event);
    expect(result.player.board.minions[0].windfury).toBe(true);
  });

  it('clears windfury on player minion when value=0', () => {
    const state = makeStateWithPlayerMinion(1, 2, 3, true);
    const event = makeTagChange('1', 'WINDFURY', '0');
    const result = applyWindfury(state, event);
    expect(result.player.board.minions[0].windfury).toBe(false);
  });

  it('no-op on hero (entity not on any board)', () => {
    const state = initialState();
    const event = makeTagChange(String(state.player.hero.entityId), 'WINDFURY', '1');
    const result = applyWindfury(state, event);
    expect(result).toBe(state);
  });

  it('no-op on non-play entity (entity not found on any board)', () => {
    const state = initialState();
    const event = makeTagChange('999', 'WINDFURY', '1');
    const result = applyWindfury(state, event);
    expect(result).toBe(state);
  });

  it('sets windfury on opponent minion when value=1', () => {
    const state = makeStateWithOpponentMinion(0, 10, 2, 3, false);
    const event = makeTagChange('10', 'WINDFURY', '1');
    const result = applyWindfury(state, event);
    expect(result.opponents[0].board.minions[0].windfury).toBe(true);
  });

  it('clears windfury on opponent minion when value=0', () => {
    const state = makeStateWithOpponentMinion(0, 10, 2, 3, true);
    const event = makeTagChange('10', 'WINDFURY', '0');
    const result = applyWindfury(state, event);
    expect(result.opponents[0].board.minions[0].windfury).toBe(false);
  });
});
