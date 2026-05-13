import { describe, expect, it } from 'bun:test';
import type { TagChange } from '@overlay/log-parser';
import { initialState } from '../initialState';
import { applyCardCost } from './cardCost';

function makeTagChange(entity: string, tag: string, value: string): TagChange {
  return { kind: 'TAG_CHANGE', entity, tag, value };
}

describe('applyCardCost', () => {
  it('updates cost on player minion', () => {
    const state = initialState();
    const event = makeTagChange('1', 'COST', '3');
    const result = applyCardCost(state, event);
    // No minion with entityId 1 exists yet, so should return unchanged
    expect(result).toBe(state);
  });

  it('updates cost on player minion that exists', () => {
    const state = initialState();
    const stateWithMinion = {
      ...state,
      player: {
        ...state.player,
        board: {
          ...state.player.board,
          minions: [
            {
              entityId: 1,
              cardId: 'TestMinion',
              attack: 2,
              health: 3,
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
            },
          ],
        },
      },
    };
    const event = makeTagChange('1', 'COST', '5');
    const result = applyCardCost(stateWithMinion, event);
    expect(result.player.board.minions[0]?.cost).toBe(5);
  });

  it('updates cost on shop minion', () => {
    const state = initialState();
    const stateWithShop = {
      ...state,
      player: {
        ...state.player,
        shop: {
          ...state.player.shop,
          minions: [
            {
              entityId: 10,
              cardId: 'ShopMinion',
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
              elite: false,
              cost: 1,
              tribes: [],
            },
          ],
        },
      },
    };
    const event = makeTagChange('10', 'COST', '4');
    const result = applyCardCost(stateWithShop, event);
    expect(result.player.shop.minions[0]?.cost).toBe(4);
  });

  it('no-op on hero', () => {
    const state = initialState();
    const event = makeTagChange('0', 'COST', '5');
    const result = applyCardCost(state, event);
    expect(result).toBe(state);
  });

  it('no-op on non-play entity', () => {
    const state = initialState();
    const event = makeTagChange('999', 'COST', '3');
    const result = applyCardCost(state, event);
    expect(result).toBe(state);
  });
});
