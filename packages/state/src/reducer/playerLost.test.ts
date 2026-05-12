import { describe, expect, it } from 'bun:test';
import { initialState } from '../initialState';
import { applyPlayerLost } from './playerLost';
import type { TagChange } from '@overlay/log-parser';

describe('applyPlayerLost', () => {
  it('marks the matching opponent as eliminated', () => {
    const base = initialState();
    const state = {
      ...base,
      opponents: [
        {
          entityId: 7,
          playerId: 2,
          hero: { entityId: 7, cardId: '', hp: 15, armor: 0 },
          board: { minions: [] },
          tier: 3,
          eliminated: false,
        },
      ],
    };

    const event: TagChange = { kind: 'TAG_CHANGE', entity: '7', tag: 'PLAYSTATE', value: 'LOST' };
    const next = applyPlayerLost(state, event);

    expect(next.opponents[0]?.eliminated).toBe(true);
  });

  it('leaves state unchanged if entity not found', () => {
    const state = initialState();
    const event: TagChange = {
      kind: 'TAG_CHANGE',
      entity: '999',
      tag: 'PLAYSTATE',
      value: 'LOST',
    };
    expect(applyPlayerLost(state, event)).toBe(state);
  });
});
