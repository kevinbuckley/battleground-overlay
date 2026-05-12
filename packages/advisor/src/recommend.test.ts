import { describe, expect, it } from 'bun:test';
import { recommend } from './recommend';
import { initialState } from '@overlay/state';
import type { Minion } from '@overlay/shared';

function minion(cardId: string, tribes: string[] = []): Minion {
  return {
    entityId: Math.floor(Math.random() * 10000),
    cardId, attack: 1, health: 1,
    taunt: false, divineShield: false, poisonous: false,
    reborn: false, frozen: false, tribes,
  };
}

describe('recommend', () => {
  it('returns empty array for empty shop', () => {
    expect(recommend(initialState())).toEqual([]);
  });

  it('returns at most 3 recommendations', () => {
    const base = initialState();
    const state = {
      ...base,
      player: {
        ...base.player,
        shop: {
          ...base.player.shop,
          minions: [
            minion('A'), minion('B'), minion('C'), minion('D'), minion('E'),
          ],
        },
      },
    };
    expect(recommend(state).length).toBeLessThanOrEqual(3);
  });

  it('ranks triple opportunity highest', () => {
    const base = initialState();
    const board = [minion('TRIPLE_CARD'), minion('TRIPLE_CARD')];
    const state = {
      ...base,
      player: {
        ...base.player,
        board: { minions: board },
        shop: {
          ...base.player.shop,
          minions: [minion('TRIPLE_CARD'), minion('OTHER')],
        },
      },
    };
    const recs = recommend(state);
    expect(recs[0]?.action.type).toBe('Buy');
    if (recs[0]?.action.type === 'Buy') {
      expect(recs[0].action.cardId).toBe('TRIPLE_CARD');
    }
  });
});
