import { describe, expect, it } from 'bun:test';
import type { TagChange } from '@overlay/log-parser';
import { initialState } from '../initialState';
import { applyDivineShield } from './divineShield';

function makeState(): import('@overlay/shared').GameState {
  const base = initialState();
  const playerMinions = [
    {
      entityId: 1,
      cardId: 'TB_BaconShop_OvergrownMinion',
      attack: 1,
      health: 2,
      taunt: false,
      divineShield: false,
      poisonous: false,
      reborn: false,
      frozen: false,
      golden: false,
      windfury: false,
      cleave: false,
      tribes: ['MURLOC'],
    },
    {
      entityId: 2,
      cardId: 'TB_BaconShop_Slime',
      attack: 2,
      health: 1,
      taunt: false,
      divineShield: false,
      poisonous: false,
      reborn: false,
      frozen: false,
      golden: false,
      windfury: false,
      cleave: false,
      tribes: ['SLIME'],
    },
  ];

  const oppMinions = [
    {
      entityId: 11,
      cardId: 'TB_BaconShop_GoldenMurloc',
      attack: 1,
      health: 1,
      taunt: false,
      divineShield: false,
      poisonous: false,
      reborn: false,
      frozen: false,
      golden: true,
      windfury: false,
      cleave: false,
      tribes: ['MURLOC'],
    },
  ];

  return {
    ...base,
    player: {
      ...base.player,
      board: { ...base.player.board, minions: playerMinions },
    },
    opponents: [
      {
        entityId: 10,
        playerId: 1,
        hero: { entityId: 10, cardId: 'Hero_Murloc', hp: 30, armor: 0 },
        board: { minions: oppMinions },
        tier: 3,
        eliminated: false,
      },
    ],
  };
}

function makeTagChange(entity: number, value: number): TagChange {
  return {
    kind: 'TAG_CHANGE',
    entity: String(entity),
    tag: 'DIVINE_SHIELD',
    value: String(value),
  };
}

describe('applyDivineShield', () => {
  it('sets divineShield=true on player minion', () => {
    const state = makeState();
    const result = applyDivineShield(state, makeTagChange(1, 1));
    const minions = result.player.board.minions;
    expect(minions[0].divineShield).toBe(true);
    expect(minions[1].divineShield).toBe(false);
  });

  it('sets divineShield=false on player minion', () => {
    const state = makeState();
    const stateWithShield = {
      ...state,
      player: {
        ...state.player,
        board: {
          ...state.player.board,
          minions: state.player.board.minions.map((m) =>
            m.entityId === 1 ? { ...m, divineShield: true } : m,
          ),
        },
      },
    };
    const result = applyDivineShield(stateWithShield, makeTagChange(1, 0));
    const minions = result.player.board.minions;
    expect(minions[0].divineShield).toBe(false);
  });

  it('sets divineShield on opponent minion', () => {
    const state = makeState();
    const result = applyDivineShield(state, makeTagChange(11, 1));
    const oppMinions = result.opponents[0].board.minions;
    expect(oppMinions[0].divineShield).toBe(true);
  });

  it('no-op on hero entity', () => {
    const state = makeState();
    const result = applyDivineShield(state, makeTagChange(state.player.entityId, 1));
    expect(result).toBe(state);
  });
});
