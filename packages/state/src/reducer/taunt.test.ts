import { describe, expect, it } from 'bun:test';
import type { TagChange } from '@overlay/log-parser';
import { initialState } from '../initialState';
import { applyTaunt } from './taunt';

function makeTagChange(entity: string, tag: string, value: string): TagChange {
  return { kind: 'TAG_CHANGE', entity, tag, value };
}

function makePlayerMinion(
  entityId: number,
  cardId: string,
  attack: number,
  health: number,
  taunt: boolean,
): import('@overlay/shared').Minion {
  return {
    entityId,
    cardId,
    attack,
    health,
    taunt,
    divineShield: false,
    poisonous: false,
    reborn: false,
    frozen: false,
    golden: false,
    tribes: [],
  };
}

function makeStateWithPlayerMinion(
  entityId: number,
  attack: number,
  health: number,
  taunt = false,
) {
  const base = initialState();
  return {
    ...base,
    player: {
      ...base.player,
      board: {
        ...base.player.board,
        minions: [makePlayerMinion(entityId, 'TestMinion', attack, health, taunt)],
      },
    },
  };
}

function makeStateWithOpponentMinion(
  oppIndex: number,
  entityId: number,
  attack: number,
  health: number,
  taunt = false,
) {
  const base = initialState();
  const opp = {
    entityId: 100 + oppIndex,
    playerId: oppIndex + 1,
    hero: { entityId: 100 + oppIndex, cardId: 'TestHero', hp: 40, armor: 0 },
    board: { minions: [makePlayerMinion(entityId, 'TestMinion', attack, health, taunt)] },
    tier: 3,
    eliminated: false,
  };
  return {
    ...base,
    opponents: [opp],
  };
}

describe('applyTaunt', () => {
  it('sets taunt on player minion when value=1', () => {
    const state = makeStateWithPlayerMinion(1, 2, 3, false);
    const event = makeTagChange('1', 'TAUNT', '1');
    const result = applyTaunt(state, event);
    expect(result.player.board.minions[0].taunt).toBe(true);
  });

  it('clears taunt on player minion when value=0', () => {
    const state = makeStateWithPlayerMinion(1, 2, 3, true);
    const event = makeTagChange('1', 'TAUNT', '0');
    const result = applyTaunt(state, event);
    expect(result.player.board.minions[0].taunt).toBe(false);
  });

  it('no-op on hero (entity not on any board)', () => {
    const state = initialState();
    const event = makeTagChange(String(state.player.hero.entityId), 'TAUNT', '1');
    const result = applyTaunt(state, event);
    expect(result).toBe(state);
  });

  it('no-op on non-play entity (entity not found on any board)', () => {
    const state = initialState();
    const event = makeTagChange('999', 'TAUNT', '1');
    const result = applyTaunt(state, event);
    expect(result).toBe(state);
  });

  it('sets taunt on opponent minion when value=1', () => {
    const state = makeStateWithOpponentMinion(0, 10, 2, 3, false);
    const event = makeTagChange('10', 'TAUNT', '1');
    const result = applyTaunt(state, event);
    expect(result.opponents[0].board.minions[0].taunt).toBe(true);
  });

  it('clears taunt on opponent minion when value=0', () => {
    const state = makeStateWithOpponentMinion(0, 10, 2, 3, true);
    const event = makeTagChange('10', 'TAUNT', '0');
    const result = applyTaunt(state, event);
    expect(result.opponents[0].board.minions[0].taunt).toBe(false);
  });
});
