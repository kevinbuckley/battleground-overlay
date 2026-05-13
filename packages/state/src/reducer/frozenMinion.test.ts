import { describe, expect, it } from 'bun:test';
import type { TagChange } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';
import { initialState } from '../initialState';
import { applyFrozenMinion } from './frozenMinion';

function makeMinion(entityId: number, health: number): import('@overlay/shared').Minion {
  return {
    entityId,
    cardId: 'test_minion',
    attack: 1,
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
    cost: 1,
    tribes: [],
  };
}

function makeOpponent(
  entityId: number,
  playerId: number,
  hp: number,
  tier: number,
  minions: import('@overlay/shared').Minion[],
): import('@overlay/shared').OpponentState {
  return {
    entityId,
    playerId,
    hero: { entityId, cardId: 'test_hero', hp, armor: 0 },
    board: { minions },
    tier,
    eliminated: false,
  };
}

function makeState(overrides: Partial<GameState> = {}): GameState {
  const base = initialState();
  const playerOverride = overrides.player ?? {};
  const heroOverride = playerOverride.hero ?? base.player.hero;
  const boardOverride = playerOverride.board ?? base.player.board;
  return {
    ...base,
    ...overrides,
    player: {
      ...base.player,
      ...playerOverride,
      hero: { ...base.player.hero, ...heroOverride },
      board: {
        ...base.player.board,
        ...boardOverride,
        minions: boardOverride.minions ?? base.player.board.minions,
      },
    },
    opponents: overrides.opponents ?? base.opponents,
  };
}

function makeTagChange(overrides: Partial<TagChange>): TagChange {
  return {
    kind: 'TAG_CHANGE',
    entity: '0',
    tag: 'FROZEN',
    value: '1',
    ...overrides,
  };
}

describe('applyFrozenMinion', () => {
  it('sets frozen=true on a player board minion', () => {
    const state = makeState({
      player: {
        board: {
          minions: [makeMinion(100, 1)],
        },
      },
    });
    const result = applyFrozenMinion(state, makeTagChange({ entity: '100' }));
    expect(result.player.board.minions[0].frozen).toBe(true);
  });

  it('sets frozen=false on a player board minion', () => {
    const minion = makeMinion(100, 1);
    minion.frozen = true;
    const state = makeState({
      player: {
        board: {
          minions: [minion],
        },
      },
    });
    const result = applyFrozenMinion(state, makeTagChange({ entity: '100', value: '0' }));
    expect(result.player.board.minions[0].frozen).toBe(false);
  });

  it('sets frozen on an opponent board minion', () => {
    const state = makeState({
      opponents: [makeOpponent(200, 1, 30, 3, [makeMinion(200, 2)])],
    });
    const result = applyFrozenMinion(state, makeTagChange({ entity: '200' }));
    expect(result.opponents[0].board.minions[0].frozen).toBe(true);
  });

  it('is no-op when entity is not on any board (player controller FROZEN tag)', () => {
    const state = initialState();
    const result = applyFrozenMinion(state, makeTagChange({ entity: '0' }));
    expect(result).toBe(state);
  });
});
