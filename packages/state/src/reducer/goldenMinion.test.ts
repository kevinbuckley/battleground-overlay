import { describe, expect, it } from 'bun:test';
import type { TagChange } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';
import { initialState } from '../initialState';
import { applyGoldenMinion } from './goldenMinion';

function makeEvent(entityId: number): TagChange {
  return {
    kind: 'TAG_CHANGE',
    entity: String(entityId),
    tag: 'PREMIUM',
    value: '1',
  };
}

function makeStateWithMinions(): GameState {
  const state = initialState();
  return {
    ...state,
    player: {
      ...state.player,
      entityId: 1,
      board: {
        minions: [
          {
            entityId: 10,
            cardId: 'CS1_129',
            attack: 3,
            health: 2,
            taunt: false,
            divineShield: false,
            poisonous: false,
            reborn: false,
            frozen: false,
            golden: false,
            tribes: ['Beast'],
          },
          {
            entityId: 11,
            cardId: 'LOOT_445',
            attack: 2,
            health: 4,
            taunt: true,
            divineShield: false,
            poisonous: false,
            reborn: false,
            frozen: false,
            golden: false,
            tribes: ['Murloc'],
          },
        ],
      },
      shop: {
        minions: [
          {
            entityId: 20,
            cardId: 'TRL_200',
            attack: 1,
            health: 1,
            taunt: false,
            divineShield: false,
            poisonous: false,
            reborn: false,
            frozen: false,
            golden: false,
            tribes: ['Murloc'],
          },
        ],
        frozen: false,
        rollCost: 1,
      },
    },
    opponents: [
      {
        entityId: 100,
        playerId: 2,
        hero: { entityId: 100, cardId: 'HERO_1', hp: 30, armor: 0 },
        board: {
          minions: [
            {
              entityId: 110,
              cardId: 'CS1_129',
              attack: 4,
              health: 3,
              taunt: false,
              divineShield: false,
              poisonous: false,
              reborn: false,
              frozen: false,
              golden: false,
              tribes: ['Beast'],
            },
          ],
        },
        tier: 4,
        eliminated: false,
      },
    ],
  };
}

describe('applyGoldenMinion', () => {
  it('sets golden=true on a player board minion when PREMIUM=1', () => {
    const state = makeStateWithMinions();
    const result = applyGoldenMinion(state, makeEvent(10));
    expect(result.player.board?.minions[0]?.golden).toBe(true);
    expect(result.player.board?.minions[1]?.golden).toBe(false);
  });

  it('sets golden=true on a shop minion when PREMIUM=1', () => {
    const state = makeStateWithMinions();
    const result = applyGoldenMinion(state, makeEvent(20));
    expect(result.player.shop?.minions[0]?.golden).toBe(true);
  });

  it('sets golden=true on an opponent board minion when PREMIUM=1', () => {
    const state = makeStateWithMinions();
    const result = applyGoldenMinion(state, makeEvent(110));
    expect(result.opponents[0]?.board?.minions[0]?.golden).toBe(true);
  });
});
