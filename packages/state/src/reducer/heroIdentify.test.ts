import { describe, expect, it } from 'bun:test';
import type { ShowEntity } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';
import { initialState } from '../initialState';
import { applyHeroIdentify } from './heroIdentify';

describe('applyHeroIdentify', () => {
  it('identifies player hero when entity is in registry with matching controller', () => {
    const base = initialState();
    const registry = new Map<number, { cardId: string; zone: string; controller: number }>([
      [3, { cardId: 'Hero_Garrosh', zone: 'PLAY', controller: 0 }],
    ]);
    const state: GameState = {
      ...base,
      player: {
        ...base.player,
        entityId: 0,
        playerId: 0,
        hero: { ...base.player.hero, entityId: 0 },
        entityRegistry: registry,
      },
    };
    const event: ShowEntity = {
      kind: 'SHOW_ENTITY',
      entity: '3',
      cardId: 'Hero_Garrosh',
    };
    const next = applyHeroIdentify(state, event);
    expect(next.player.hero.cardId).toBe('Hero_Garrosh');
  });

  it('identifies opponent hero when entity is in registry with matching opponent controller', () => {
    const base = initialState();
    const baseOpp = base.opponents[0] ?? {
      entityId: 0,
      playerId: 0,
      tier: 3,
      eliminated: false,
      board: { minions: [] },
      hero: { entityId: 0, cardId: '', hp: 40, armor: 0 },
    };
    const opp: GameState['opponents'][number] = {
      ...baseOpp,
      entityId: 7,
      playerId: 1,
      tier: 3,
      eliminated: false,
      board: { minions: [] },
      hero: { ...baseOpp.hero, entityId: 7 },
    };
    const registry = new Map<number, { cardId: string; zone: string; controller: number }>([
      [7, { cardId: 'Hero_Illidan', zone: 'PLAY', controller: 1 }],
    ]);
    const state: GameState = {
      ...base,
      opponents: [opp],
      player: {
        ...base.player,
        entityId: 0,
        playerId: 0,
        hero: { ...base.player.hero, entityId: 0 },
        entityRegistry: registry,
      },
    };
    const event: ShowEntity = {
      kind: 'SHOW_ENTITY',
      entity: '7',
      cardId: 'Hero_Illidan',
    };
    const next = applyHeroIdentify(state, event);
    expect(next.opponents[0]?.hero.cardId).toBe('Hero_Illidan');
  });

  it('returns unchanged when cardId does not start with Hero_', () => {
    const state = initialState();
    const event: ShowEntity = {
      kind: 'SHOW_ENTITY',
      entity: '5',
      cardId: 'CSW_198',
    };
    const next = applyHeroIdentify(state, event);
    expect(next).toBe(state);
  });

  it('returns unchanged when player hero is already identified (entityId !== 0)', () => {
    const base = initialState();
    const registry = new Map<number, { cardId: string; zone: string; controller: number }>([
      [3, { cardId: 'Hero_Garrosh', zone: 'PLAY', controller: 0 }],
    ]);
    const state: GameState = {
      ...base,
      player: {
        ...base.player,
        entityId: 0,
        playerId: 0,
        hero: { ...base.player.hero, entityId: 3, cardId: 'Hero_Garrosh' },
        entityRegistry: registry,
      },
    };
    const event: ShowEntity = {
      kind: 'SHOW_ENTITY',
      entity: '3',
      cardId: 'Hero_Garrosh',
    };
    const next = applyHeroIdentify(state, event);
    expect(next.player.hero.cardId).toBe('Hero_Garrosh');
  });
});
