import { describe, expect, it } from 'bun:test';
import type { TagChange } from '@overlay/log-parser';
import { initialState } from '../initialState';
import { applyPlayerDeath } from './playerDeath';

function makeEvent(entity: string, tag: string, value: string): TagChange {
  return { kind: 'TAG_CHANGE', entity, tag, value };
}

describe('applyPlayerDeath', () => {
  it('sets player.eliminated = true when player HP reaches 0', () => {
    const state = initialState();
    const event = makeEvent('0', 'HEALTH', '0');
    const result = applyPlayerDeath(state, event);
    expect(result.player.eliminated).toBe(true);
  });

  it('is a no-op when player HP is greater than 0', () => {
    const state = initialState();
    const event = makeEvent('0', 'HEALTH', '5');
    const result = applyPlayerDeath(state, event);
    expect(result.player.eliminated).toBe(false);
  });

  it('is a no-op when already eliminated', () => {
    const state = initialState();
    const event = makeEvent('0', 'HEALTH', '0');
    const result = applyPlayerDeath(state, event);
    const event2 = makeEvent('0', 'HEALTH', '0');
    const result2 = applyPlayerDeath(result, event2);
    expect(result2.player.eliminated).toBe(true);
  });
});
