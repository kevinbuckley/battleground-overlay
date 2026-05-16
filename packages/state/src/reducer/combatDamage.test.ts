import { describe, expect, it } from 'bun:test';
import type { TagChange } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';
import { initialState } from '../initialState';
import { applyCombatDamage } from './combatDamage';

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
    tribes: [],
    charge: false,
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

function makeTagChange(entity: string, tag: string, value: string): TagChange {
  return { kind: 'TAG_CHANGE', entity, tag, value };
}

describe('applyCombatDamage', () => {
  it('ignores non-DAMAGE tags', () => {
    const state = makeState();
    const event = makeTagChange('1', 'HEALTH', '35');
    const result = applyCombatDamage(state, event);
    expect(result.player.hero.hp).toBe(40);
  });

  it('ignores unknown entity IDs', () => {
    const state = makeState();
    const event = makeTagChange('999', 'DAMAGE', '3');
    const result = applyCombatDamage(state, event);
    expect(result.player.hero.hp).toBe(40);
  });

  it('reduces player hero HP by damage amount', () => {
    const state = makeState({
      player: {
        ...initialState().player,
        hero: { ...initialState().player.hero, entityId: 1, hp: 20 },
      },
    });
    const event = makeTagChange('1', 'DAMAGE', '5');
    const result = applyCombatDamage(state, event);
    expect(result.player.hero.hp).toBe(15);
  });

  it('clamps hero HP to 0 (no negative HP)', () => {
    const state = makeState({
      player: {
        ...initialState().player,
        hero: { ...initialState().player.hero, entityId: 1, hp: 2 },
      },
    });
    const event = makeTagChange('1', 'DAMAGE', '5');
    const result = applyCombatDamage(state, event);
    expect(result.player.hero.hp).toBe(0);
  });

  it('reduces minion health on player board', () => {
    const minion = makeMinion(10, 5);
    const state = makeState({
      player: {
        ...initialState().player,
        hero: { ...initialState().player.hero, entityId: 1 },
        board: { minions: [minion] },
      },
    });
    const event = makeTagChange('10', 'DAMAGE', '2');
    const result = applyCombatDamage(state, event);
    expect(result.player.board.minions[0].health).toBe(3);
  });

  it('removes minion from board when health reaches 0', () => {
    const minion = makeMinion(10, 3);
    const state = makeState({
      player: {
        ...initialState().player,
        hero: { ...initialState().player.hero, entityId: 1 },
        board: { minions: [minion] },
      },
    });
    const event = makeTagChange('10', 'DAMAGE', '3');
    const result = applyCombatDamage(state, event);
    expect(result.player.board.minions).toHaveLength(0);
  });

  it('preserves persistent board minions during BG combat damage', () => {
    const minion = makeMinion(10, 3);
    const state = makeState({
      phase: 'combat',
      player: {
        ...initialState().player,
        hero: { ...initialState().player.hero, entityId: 1 },
        board: { minions: [minion] },
      },
    });
    const event = makeTagChange('10', 'DAMAGE', '3');
    const result = applyCombatDamage(state, event);
    expect(result.player.board.minions).toHaveLength(1);
    expect(result.player.board.minions[0].health).toBe(3);
  });

  it('handles 3 damage to 2-health minion removes it', () => {
    const minion = makeMinion(10, 2);
    const state = makeState({
      player: {
        ...initialState().player,
        hero: { ...initialState().player.hero, entityId: 1 },
        board: { minions: [minion] },
      },
    });
    const event = makeTagChange('10', 'DAMAGE', '3');
    const result = applyCombatDamage(state, event);
    expect(result.player.board.minions).toHaveLength(0);
  });

  it('preserves other minions when one dies', () => {
    const m1 = makeMinion(10, 2);
    const m2 = makeMinion(11, 5);
    const m3 = makeMinion(12, 3);
    const state = makeState({
      player: {
        ...initialState().player,
        hero: { ...initialState().player.hero, entityId: 1 },
        board: { minions: [m1, m2, m3] },
      },
    });
    const event = makeTagChange('10', 'DAMAGE', '3');
    const result = applyCombatDamage(state, event);
    expect(result.player.board.minions).toHaveLength(2);
    expect(result.player.board.minions.find((m) => m.entityId === 11)?.health).toBe(5);
    expect(result.player.board.minions.find((m) => m.entityId === 12)?.health).toBe(3);
  });

  it('updates opponent minion health', () => {
    const minion = makeMinion(20, 4);
    const opp = makeOpponent(2, 1, 10, 3, [minion]);
    const state = makeState({ opponents: [opp] });
    const event = makeTagChange('20', 'DAMAGE', '1');
    const result = applyCombatDamage(state, event);
    expect(result.opponents[0].board.minions[0].health).toBe(3);
  });

  it('removes dead opponent minion from board', () => {
    const minion = makeMinion(20, 2);
    const opp = makeOpponent(2, 1, 10, 3, [minion]);
    const state = makeState({ opponents: [opp] });
    const event = makeTagChange('20', 'DAMAGE', '2');
    const result = applyCombatDamage(state, event);
    expect(result.opponents[0].board.minions).toHaveLength(0);
  });

  it('handles damage to multiple opponents simultaneously', () => {
    const m1 = makeMinion(10, 3);
    const m2 = makeMinion(20, 2);
    const opp1 = makeOpponent(1, 1, 10, 3, [m1]);
    const opp2 = makeOpponent(2, 2, 8, 4, [m2]);
    const state = makeState({ opponents: [opp1, opp2] });

    // Damage to opponent 1's minion
    const event1 = makeTagChange('10', 'DAMAGE', '1');
    const result1 = applyCombatDamage(state, event1);
    expect(result1.opponents[0].board.minions[0].health).toBe(2);

    // Damage to opponent 2's minion (kills it)
    const event2 = makeTagChange('20', 'DAMAGE', '2');
    const result2 = applyCombatDamage(result1, event2);
    expect(result2.opponents[1].board.minions).toHaveLength(0);
  });

  it('ignores invalid entity string', () => {
    const state = makeState();
    const event = makeTagChange('abc', 'DAMAGE', '3');
    const result = applyCombatDamage(state, event);
    expect(result.player.hero.hp).toBe(40);
  });

  it('ignores invalid damage value', () => {
    const state = makeState();
    const event = makeTagChange('1', 'DAMAGE', 'xyz');
    const result = applyCombatDamage(state, event);
    expect(result.player.hero.hp).toBe(40);
  });
});
