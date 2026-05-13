import { describe, expect, it } from 'bun:test';
import { resolveCardId } from './entityCardId';
import { initialState } from './initialState';

describe('resolveCardId', () => {
  it('returns cardId when entity is in registry', () => {
    const state = initialState();
    state.player.entityRegistry.set(42, { cardId: 'TB_Golakka_Club', zone: 'PLAY', controller: 0 });
    expect(resolveCardId(42, state)).toBe('TB_Golakka_Club');
  });

  it('returns null when entity is not in registry', () => {
    const state = initialState();
    expect(resolveCardId(999, state)).toBeNull();
  });

  it('returns null when registry is empty', () => {
    const state = initialState();
    expect(state.player.entityRegistry.size).toBe(0);
    expect(resolveCardId(1, state)).toBeNull();
  });
});
