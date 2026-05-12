import { describe, expect, it } from 'bun:test';
import type { TagChange } from '@overlay/log-parser';
import { initialState } from '../initialState';
import { applySilence } from './silence';

function makeTagChange(overrides: Partial<TagChange> = {}): TagChange {
  return {
    kind: 'TAG_CHANGE',
    entity: '1',
    tag: 'SILENCED',
    value: '1',
    ...overrides,
  };
}

function makePlayerMinion(
  entityId: number,
  cardId: string,
  attack: number,
  health: number,
  opts?: { taunt?: boolean; divineShield?: boolean; poisonous?: boolean; reborn?: boolean },
): import('@overlay/shared').Minion {
  return {
    entityId,
    cardId,
    attack,
    health,
    taunt: opts?.taunt ?? false,
    divineShield: opts?.divineShield ?? false,
    poisonous: opts?.poisonous ?? false,
    reborn: opts?.reborn ?? false,
    frozen: false,
    golden: false,
    tribes: [],
  };
}

function makeStateWithPlayerMinionMechanics(entityId: number) {
  const base = initialState();
  return {
    ...base,
    player: {
      ...base.player,
      board: {
        ...base.player.board,
        minions: [
          makePlayerMinion(entityId, 'TestMinion', 3, 3, {
            taunt: true,
            divineShield: true,
            poisonous: true,
            reborn: true,
          }),
        ],
      },
    },
  };
}

function makeStateWithOpponentMinion(oppIndex: number, entityId: number) {
  const base = initialState();
  const opp = {
    entityId: 100 + oppIndex,
    playerId: oppIndex + 1,
    hero: { entityId: 100 + oppIndex, cardId: 'TestHero', hp: 40, armor: 0 },
    board: {
      minions: [
        makePlayerMinion(entityId, 'TestMinion', 2, 4, {
          taunt: true,
          divineShield: true,
          poisonous: true,
          reborn: true,
        }),
      ],
    },
    tier: 4,
    eliminated: false,
  };
  return {
    ...base,
    opponents: [opp],
  };
}

describe('applySilence', () => {
  it('clears all mechanics on a player minion when SILENCED=1', () => {
    const state = makeStateWithPlayerMinionMechanics(100);
    const event = makeTagChange({ entity: '100' });
    const result = applySilence(state, event);
    const minion = result.player.board.minions[0];
    expect(minion.taunt).toBe(false);
    expect(minion.divineShield).toBe(false);
    expect(minion.poisonous).toBe(false);
    expect(minion.reborn).toBe(false);
  });

  it('clears all mechanics on an opponent minion when SILENCED=1', () => {
    const state = makeStateWithOpponentMinion(0, 200);
    const event = makeTagChange({ entity: '200' });
    const result = applySilence(state, event);
    const minion = result.opponents[0].board.minions[0];
    expect(minion.taunt).toBe(false);
    expect(minion.divineShield).toBe(false);
    expect(minion.poisonous).toBe(false);
    expect(minion.reborn).toBe(false);
  });

  it('is a no-op when SILENCED is not 1', () => {
    const state = makeStateWithPlayerMinionMechanics(100);
    const event = makeTagChange({ entity: '100', value: '0' });
    const result = applySilence(state, event);
    expect(result).toBe(state);
  });

  it('is a no-op on a non-play entity (hero)', () => {
    const state = initialState();
    const event = makeTagChange({ entity: String(state.player.hero.entityId) });
    const result = applySilence(state, event);
    expect(result).toBe(state);
  });
});
