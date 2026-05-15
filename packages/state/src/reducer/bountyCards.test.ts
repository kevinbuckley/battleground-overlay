import { describe, expect, it } from 'bun:test';
import { initialState } from '../initialState';
import { applyBountyCards } from './bountyCards';

describe('applyBountyCards', () => {
  it('initial=0', () => {
    const state = initialState();
    const result = applyBountyCards(state, {
      kind: 'TAG_CHANGE',
      entity: String(state.player.entityId),
      tag: 'NUM_BOUNTY_CARDS',
      value: '0',
    });
    expect(result.player.bountyCards).toBe(0);
  });

  it('updates on bounty card grant', () => {
    const state = initialState();
    const result = applyBountyCards(state, {
      kind: 'TAG_CHANGE',
      entity: String(state.player.entityId),
      tag: 'NUM_BOUNTY_CARDS',
      value: '3',
    });
    expect(result.player.bountyCards).toBe(3);
  });

  it('no-op on opponent', () => {
    const state = initialState();
    const result = applyBountyCards(state, {
      kind: 'TAG_CHANGE',
      entity: '999',
      tag: 'NUM_BOUNTY_CARDS',
      value: '5',
    });
    expect(result.player.bountyCards).toBe(0);
  });

  it('reflected in state', () => {
    const state = initialState();
    const result = applyBountyCards(state, {
      kind: 'TAG_CHANGE',
      entity: String(state.player.entityId),
      tag: 'NUM_BOUNTY_CARDS',
      value: '7',
    });
    expect(result.player.bountyCards).toBe(7);
  });
});
