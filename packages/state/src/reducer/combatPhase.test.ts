import { describe, expect, it } from 'bun:test';
import type { BlockStart, HsEvent, TagChange } from '@overlay/log-parser';
import type { GameState, Minion } from '@overlay/shared';
import { initialState } from '../initialState';
import { resolveCombatPhase } from './combatPhase';

function makeMinion(entityId: number, health: number, attack = 1): Minion {
  return {
    entityId,
    cardId: 'test_minion',
    attack,
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
  minions: Minion[],
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

function makeBlockStart(
  blockType: string,
  triggerKeyword: string,
  entity: string,
  target = 'HAND',
  effectCardId = '',
): BlockStart {
  return {
    kind: 'BLOCK_START',
    blockType,
    entity,
    effectCardId,
    effectIndex: 0,
    target,
    subOption: '',
    triggerKeyword,
  };
}

describe('resolveCombatPhase', () => {
  it('returns state unchanged when no combat-relevant events', () => {
    const state = makeState();
    const events: HsEvent[] = [];
    const result = resolveCombatPhase(state, events);
    expect(result.player.hero.hp).toBe(40);
    expect(result.player.board.minions).toHaveLength(0);
  });

  it('applies damage events in order', () => {
    const minion = makeMinion(10, 5);
    const state = makeState({
      player: {
        ...initialState().player,
        hero: { ...initialState().player.hero, entityId: 1 },
        board: { minions: [minion] },
      },
    });
    const events: HsEvent[] = [
      makeTagChange('10', 'DAMAGE', '2'),
      makeTagChange('10', 'DAMAGE', '2'),
    ];
    const result = resolveCombatPhase(state, events);
    expect(result.player.board.minions[0].health).toBe(1);
  });

  it('removes minion from board when health reaches 0 during combat', () => {
    const minion = makeMinion(10, 3);
    const state = makeState({
      player: {
        ...initialState().player,
        hero: { ...initialState().player.hero, entityId: 1 },
        board: { minions: [minion] },
      },
    });
    const events: HsEvent[] = [makeTagChange('10', 'DAMAGE', '3')];
    const result = resolveCombatPhase(state, events);
    expect(result.player.board.minions).toHaveLength(0);
  });

  it('handles 2v2 combat with deathrattles resolves correctly', () => {
    const playerMinion1 = makeMinion(10, 3);
    const playerMinion2 = makeMinion(11, 2);
    const oppMinion1 = makeMinion(20, 3);
    const oppMinion2 = makeMinion(21, 2);

    const state = makeState({
      player: {
        ...initialState().player,
        entityId: 1,
        playerId: 1,
        hero: { ...initialState().player.hero, entityId: 1 },
        board: { minions: [playerMinion1, playerMinion2] },
        entityRegistry: new Map([
          [10, { cardId: 'test_minion', zone: 'PLAY', controller: 1 }],
          [11, { cardId: 'test_minion', zone: 'PLAY', controller: 1 }],
        ]),
      },
      opponents: [makeOpponent(2, 1, 10, 3, [oppMinion1, oppMinion2])],
    });

    const events: HsEvent[] = [
      // Player's 3-health minion takes 3 damage and dies
      makeTagChange('10', 'DAMAGE', '3'),
      // Player's 2-health minion takes 2 damage and dies
      makeTagChange('11', 'DAMAGE', '2'),
      // Opponent's 3-health minion takes 3 damage and dies
      makeTagChange('20', 'DAMAGE', '3'),
      // Opponent's 2-health minion takes 2 damage and dies
      makeTagChange('21', 'DAMAGE', '2'),
    ];

    const result = resolveCombatPhase(state, events);

    // Both player minions should be dead
    expect(result.player.board.minions).toHaveLength(0);
    // Both opponent minions should be dead
    expect(result.opponents[0].board.minions).toHaveLength(0);
  });

  it('handles deathrattle events during combat phase', () => {
    const minion = makeMinion(10, 3);
    const state = makeState({
      player: {
        ...initialState().player,
        entityId: 1,
        playerId: 1,
        hero: { ...initialState().player.hero, entityId: 1 },
        board: { minions: [minion] },
        entityRegistry: new Map([[10, { cardId: 'test_card', zone: 'PLAY', controller: 1 }]]),
      },
    });

    const deathrattleEvent: BlockStart = makeBlockStart(
      'TRIGGER',
      'DEATHRATTLE: Add a minion',
      '10',
      'HAND',
    );

    const events: HsEvent[] = [makeTagChange('10', 'DAMAGE', '3'), deathrattleEvent];

    const result = resolveCombatPhase(state, events);

    // The original minion should be dead
    expect(result.player.board.minions).toHaveLength(0);
    // Deathrattle should have added a new minion to hand
    expect(result.player.hand).toHaveLength(1);
  });

  it('handles multi-opponent combat with mixed outcomes', () => {
    const playerMinion = makeMinion(10, 5);
    const opp1Minion = makeMinion(20, 3);
    const opp2Minion = makeMinion(30, 8);

    const state = makeState({
      player: {
        ...initialState().player,
        hero: { ...initialState().player.hero, entityId: 1 },
        board: { minions: [playerMinion] },
      },
      opponents: [makeOpponent(1, 1, 10, 3, [opp1Minion]), makeOpponent(2, 2, 10, 5, [opp2Minion])],
    });

    const events: HsEvent[] = [
      // Player's minion deals 3 damage to opponent 1 (kills it)
      makeTagChange('20', 'DAMAGE', '3'),
      // Player's minion takes 5 damage (dies)
      makeTagChange('10', 'DAMAGE', '5'),
      // Player's hero takes 2 damage
      makeTagChange('1', 'DAMAGE', '2'),
    ];

    const result = resolveCombatPhase(state, events);

    // Opponent 1's minion should be dead
    expect(result.opponents[0].board.minions).toHaveLength(0);
    // Player's minion should be dead
    expect(result.player.board.minions).toHaveLength(0);
    // Player's hero should have 38 HP (40 - 2)
    expect(result.player.hero.hp).toBe(38);
    // Opponent 2's minion should still be alive
    expect(result.opponents[1].board.minions[0].health).toBe(8);
  });

  it('ignores non-combat events gracefully', () => {
    const state = makeState();
    const events: HsEvent[] = [
      makeTagChange('1', 'HEALTH', '35'),
      makeTagChange('2', 'PLAYER_TECH_LEVEL', '4'),
    ];
    const result = resolveCombatPhase(state, events);
    expect(result.player.hero.hp).toBe(40);
  });
});
