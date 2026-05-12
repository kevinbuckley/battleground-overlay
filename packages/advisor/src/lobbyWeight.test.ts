import { describe, expect, it } from 'bun:test';
import { lobbyWeights } from './lobbyWeight';

describe('lobbyWeights', () => {
  it('returns 0 for eliminated opponents', () => {
    const opponents = [
      {
        entityId: 1,
        playerId: 1,
        hero: { entityId: 10, cardId: 'HERO1', hp: 30, armor: 0 },
        board: { minions: [] },
        tier: 5,
        eliminated: true,
      },
      {
        entityId: 2,
        playerId: 2,
        hero: { entityId: 20, cardId: 'HERO2', hp: 15, armor: 0 },
        board: { minions: [] },
        tier: 5,
        eliminated: false,
      },
      {
        entityId: 3,
        playerId: 3,
        hero: { entityId: 30, cardId: 'HERO3', hp: 15, armor: 0 },
        board: { minions: [] },
        tier: 5,
        eliminated: false,
      },
    ];

    const weights = lobbyWeights(opponents);
    expect(weights).toEqual([0, 0.5, 0.5]);
  });

  it('sums to 1.0 when one opponent is eliminated', () => {
    const opponents = [
      {
        entityId: 1,
        playerId: 1,
        hero: { entityId: 10, cardId: 'HERO1', hp: 30, armor: 0 },
        board: { minions: [] },
        tier: 5,
        eliminated: true,
      },
      {
        entityId: 2,
        playerId: 2,
        hero: { entityId: 20, cardId: 'HERO2', hp: 10, armor: 0 },
        board: { minions: [] },
        tier: 5,
        eliminated: false,
      },
      {
        entityId: 3,
        playerId: 3,
        hero: { entityId: 30, cardId: 'HERO3', hp: 20, armor: 0 },
        board: { minions: [] },
        tier: 5,
        eliminated: false,
      },
    ];

    const weights = lobbyWeights(opponents);
    const sum = weights.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1.0);
  });

  it('returns 0 for all when all are eliminated', () => {
    const opponents = [
      {
        entityId: 1,
        playerId: 1,
        hero: { entityId: 10, cardId: 'HERO1', hp: 30, armor: 0 },
        board: { minions: [] },
        tier: 5,
        eliminated: true,
      },
      {
        entityId: 2,
        playerId: 2,
        hero: { entityId: 20, cardId: 'HERO2', hp: 15, armor: 0 },
        board: { minions: [] },
        tier: 5,
        eliminated: true,
      },
    ];

    const weights = lobbyWeights(opponents);
    expect(weights).toEqual([0, 0]);
  });

  it('returns correct weights for all alive opponents with different hp', () => {
    const opponents = [
      {
        entityId: 1,
        playerId: 1,
        hero: { entityId: 10, cardId: 'HERO1', hp: 5, armor: 0 },
        board: { minions: [] },
        tier: 5,
        eliminated: false,
      },
      {
        entityId: 2,
        playerId: 2,
        hero: { entityId: 20, cardId: 'HERO2', hp: 15, armor: 0 },
        board: { minions: [] },
        tier: 5,
        eliminated: false,
      },
      {
        entityId: 3,
        playerId: 3,
        hero: { entityId: 30, cardId: 'HERO3', hp: 10, armor: 0 },
        board: { minions: [] },
        tier: 5,
        eliminated: false,
      },
    ];

    const weights = lobbyWeights(opponents);
    expect(weights).toEqual([5 / 30, 15 / 30, 10 / 30]);
  });

  it('returns empty array for empty opponents list', () => {
    expect(lobbyWeights([])).toEqual([]);
  });
});
