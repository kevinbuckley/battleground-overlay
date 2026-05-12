import { describe, expect, it } from 'bun:test';
import type { TagChange } from '@overlay/log-parser';
import { initialState } from '../initialState';
import { applyHandTracker } from './handTracker';

function makeTagChange(overrides: Partial<TagChange>): TagChange {
  return {
    kind: 'TAG_CHANGE',
    entity: '10',
    tag: 'ZONE',
    value: 'HAND',
    ...overrides,
  };
}

describe('applyHandTracker', () => {
  it('adds entity to hand when ZONE=HAND and entity is not already in hand', () => {
    const state = initialState();
    const stateWithHand = {
      ...state,
      player: {
        ...state.player,
        hand: [],
        entityRegistry: new Map([[10, { cardId: 'CS2_189', zone: 'PLAY', controller: 0 }]]),
      },
    };
    const event = makeTagChange({ entity: '10', value: 'HAND' });
    const result = applyHandTracker(stateWithHand, event);
    expect(result.player.hand).toEqual([10]);
  });

  it('does not add duplicate entity to hand', () => {
    const state = initialState();
    const stateWithHand = {
      ...state,
      player: {
        ...state.player,
        hand: [10],
        entityRegistry: new Map([[10, { cardId: 'CS2_189', zone: 'PLAY', controller: 0 }]]),
      },
    };
    const event = makeTagChange({ entity: '10', value: 'HAND' });
    const result = applyHandTracker(stateWithHand, event);
    expect(result.player.hand).toEqual([10]);
  });

  it('removes entity from hand when ZONE=GRAVEYARD', () => {
    const state = initialState();
    const stateWithHand = {
      ...state,
      player: {
        ...state.player,
        hand: [10, 20],
        entityRegistry: new Map([
          [10, { cardId: 'CS2_189', zone: 'HAND', controller: 0 }],
          [20, { cardId: 'CS2_190', zone: 'HAND', controller: 0 }],
        ]),
      },
    };
    const event = makeTagChange({ entity: '10', value: 'GRAVEYARD' });
    const result = applyHandTracker(stateWithHand, event);
    expect(result.player.hand).toEqual([20]);
  });

  it('ignores non-TAG_CHANGE events', () => {
    const state = initialState();
    const event = { kind: 'BLOCK_START' } as unknown as TagChange;
    const result = applyHandTracker(state, event);
    expect(result.player.hand).toEqual([]);
  });
});
