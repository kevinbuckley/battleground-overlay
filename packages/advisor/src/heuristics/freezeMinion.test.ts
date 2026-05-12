import { describe, expect, it } from 'bun:test';
import type { Minion } from '@overlay/shared';
import { initialState } from '@overlay/state';
import { freezeMinion } from './freezeMinion';

function minion(cardId: string, tribes: string[] = []): Minion {
  return {
    entityId: Math.floor(Math.random() * 10000),
    cardId,
    attack: 1,
    health: 1,
    taunt: false,
    divineShield: false,
    poisonous: false,
    reborn: false,
    frozen: false,
    tribes,
  };
}

function makeState(
  overrides: Partial<ReturnType<typeof initialState>> = {},
): ReturnType<typeof initialState> {
  const base = initialState();
  return {
    ...base,
    ...overrides,
    player: {
      ...base.player,
      ...overrides.player,
      hero: {
        ...base.player.hero,
        ...overrides.player?.hero,
      },
      shop: {
        ...base.player.shop,
        ...overrides.player?.shop,
      },
      board: {
        minions: overrides.player?.board?.minions ?? [],
      },
    },
  };
}

describe('freezeMinion', () => {
  it('returns null for empty shop', () => {
    const state = makeState();
    expect(freezeMinion(state)).toBeNull();
  });

  it('returns null when freezeScore is below threshold (unsafe hp)', () => {
    const shopMinion = minion('DRAGON', ['Dragon']);
    const state = makeState({
      player: {
        shop: { ...initialState().player.shop, minions: [shopMinion] },
        hero: { ...initialState().player.hero, hp: 3 },
      },
    });
    expect(freezeMinion(state)).toBeNull();
  });

  it('returns null when shop has no synergy or triple and hp is borderline', () => {
    const shopMinion = minion('WEAK_CARD');
    const state = makeState({
      player: {
        shop: { ...initialState().player.shop, minions: [shopMinion] },
        hero: { ...initialState().player.hero, hp: 6 },
      },
    });
    // freezeScore returns 0.2 for safe hp with no synergy/triple,
    // which is < 0.5 threshold → null
    expect(freezeMinion(state)).toBeNull();
  });

  it('returns Freeze action when shop has triple opportunity and hp is safe', () => {
    const boardMinion = minion('DRAGON', ['Dragon']);
    const shopMinion = minion('DRAGON', ['Dragon']);
    const state = makeState({
      player: {
        board: { minions: [boardMinion] },
        shop: { ...initialState().player.shop, minions: [shopMinion] },
        hero: { ...initialState().player.hero, hp: 10 },
      },
    });
    const result = freezeMinion(state);
    expect(result).not.toBeNull();
    if (result) {
      expect(result.type).toBe('Freeze');
    }
  });

  it('returns Freeze action when shop has tribe synergy and hp is safe', () => {
    const boardMinion = minion('BEAST', ['Beast']);
    const shopMinion = minion('ANOTHER_BEAST', ['Beast']);
    const state = makeState({
      player: {
        board: { minions: [boardMinion] },
        shop: { ...initialState().player.shop, minions: [shopMinion] },
        hero: { ...initialState().player.hero, hp: 10 },
      },
    });
    const result = freezeMinion(state);
    expect(result).not.toBeNull();
    if (result) {
      expect(result.type).toBe('Freeze');
    }
  });

  it('returns null when shop has minions but score < 0.5', () => {
    // Low hp (just below threshold) with no synergy → freezeScore = 0
    const shopMinion = minion('WEAK');
    const state = makeState({
      player: {
        shop: { ...initialState().player.shop, minions: [shopMinion] },
        hero: { ...initialState().player.hero, hp: 5 },
      },
    });
    expect(freezeMinion(state)).toBeNull();
  });
});
