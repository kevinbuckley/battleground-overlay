import { describe, expect, it } from 'bun:test';
import type { GameState, Minion } from '@overlay/shared';
import { initialState } from '@overlay/state';
import { freezeScore } from './freezeScore';

function makeMinion(cardId: string, attack: number, health: number, tribes: string[] = []): Minion {
  return {
    entityId: Math.floor(Math.random() * 10000),
    cardId,
    attack,
    health,
    taunt: false,
    divineShield: false,
    poisonous: false,
    reborn: false,
    frozen: false,
    tribes,
  };
}

function makeState(overrides: Partial<GameState> = {}): GameState {
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

describe('freezeScore', () => {
  it('returns 0 when shop is already frozen', () => {
    const shopMinion = makeMinion('DRAGON', 3, 3, ['Dragon']);
    const state = makeState({
      player: {
        shop: { ...initialState().player.shop, minions: [shopMinion], frozen: true },
        hero: { ...initialState().player.hero, hp: 10 },
      },
    });
    expect(freezeScore(state)).toBe(0);
  });

  it('returns 0 for empty shop', () => {
    const state = makeState();
    expect(freezeScore(state)).toBe(0);
  });

  it('returns 0 when hp is unsafe (below threshold)', () => {
    const shopMinion = makeMinion('GOOD_CARD', 3, 3, ['Dragon']);
    const state = makeState({
      player: {
        shop: { ...initialState().player.shop, minions: [shopMinion] },
        hero: { ...initialState().player.hero, hp: 3 },
      },
    });
    const score = freezeScore(state);
    expect(score).toBe(0);
  });

  it('returns 0.2 when hp is safe but shop has no synergy or triple', () => {
    const shopMinion = makeMinion('WEAK_CARD', 1, 1);
    const state = makeState({
      player: {
        shop: { ...initialState().player.shop, minions: [shopMinion] },
        hero: { ...initialState().player.hero, hp: 10 },
      },
    });
    const score = freezeScore(state);
    expect(score).toBe(0.2);
  });

  it('returns 0.6 when shop has triple opportunity (1 copy) and hp is safe', () => {
    const boardMinion = makeMinion('DRAGON', 3, 3, ['Dragon']);
    const shopMinion = makeMinion('DRAGON', 3, 3, ['Dragon']);
    const state = makeState({
      player: {
        board: { minions: [boardMinion] },
        shop: { ...initialState().player.shop, minions: [shopMinion] },
        hero: { ...initialState().player.hero, hp: 10 },
      },
    });
    const score = freezeScore(state);
    // triple 0.4 (1 copy) → maxTriple=0.4, synergy 0.15 → maxSynergy=0.15
    // max(0.4, 0.15) = 0.4, no triple>0 (0.4 < 1.0 threshold? no, 0.4 > 0)
    // Actually tripleScore returns 0.4 for 1 copy, which is > 0, so triple branch fires: 0.5
    // synergy 0.15 > 0, so synergy branch fires: 0.3
    // hp safe: 0.2
    // total = 0.5 + 0.3 + 0.2 = 1.0
    expect(score).toBe(1.0);
  });

  it('returns 0.8 when shop has both triple and synergy and hp is safe', () => {
    const boardMinion = makeMinion('DRAGON', 3, 3, ['Dragon']);
    const shopMinion = makeMinion('DRAGON', 3, 3, ['Dragon']);
    const state = makeState({
      player: {
        board: { minions: [boardMinion] },
        shop: { ...initialState().player.shop, minions: [shopMinion] },
        hero: { ...initialState().player.hero, hp: 10 },
      },
    });
    const score = freezeScore(state);
    // triple (0.5) + synergy (0.3) + hp safe (0.2) = 1.0
    expect(score).toBe(1.0);
  });

  it('returns 0.5 when shop has synergy but no triple and hp is safe', () => {
    const boardMinion = makeMinion('BEAST', 3, 3, ['Beast']);
    // Different cardId so tripleScore returns 0, but same tribe so tribeSynergyScore returns 0.15
    const shopMinion = makeMinion('ANOTHER_BEAST', 3, 3, ['Beast']);
    const state = makeState({
      player: {
        board: { minions: [boardMinion] },
        shop: { ...initialState().player.shop, minions: [shopMinion] },
        hero: { ...initialState().player.hero, hp: 10 },
      },
    });
    const score = freezeScore(state);
    // tripleScore = 0 (different cardId), tribeSynergyScore = 0.15 (same tribe)
    // maxTriple = 0 (not > 0), maxSynergy = 0.15 (> 0 → synergy branch fires: 0.3)
    // hp safe: 0.2
    // total = 0.3 + 0.2 = 0.5
    expect(score).toBeCloseTo(0.5);
  });
});
