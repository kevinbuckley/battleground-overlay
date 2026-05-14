import { describe, expect, it } from 'bun:test';
import type { Minion } from '@overlay/shared';
import { tripleScore } from './triple';

function makeMinion(cardId: string): Minion {
  return {
    entityId: 0,
    cardId,
    attack: 1,
    health: 1,
    taunt: false,
    divineShield: false,
    poisonous: false,
    reborn: false,
    frozen: false,
    tribes: [],
  };
}

describe('tripleScore', () => {
  it('returns 1.0 when two copies already on board', () => {
    const board = [makeMinion('CS2_168'), makeMinion('CS2_168')];
    expect(tripleScore(makeMinion('CS2_168'), board)).toBe(1.0);
  });

  it('returns 0.4 when one copy on board', () => {
    const board = [makeMinion('CS2_168')];
    expect(tripleScore(makeMinion('CS2_168'), board)).toBe(0.4);
  });

  it('returns 0 when no copies on board', () => {
    expect(tripleScore(makeMinion('CS2_168'), [])).toBe(0);
  });

  it('returns 0 when board has different cardIds', () => {
    const board = [makeMinion('CS2_169'), makeMinion('CS2_170')];
    expect(tripleScore(makeMinion('CS2_168'), board)).toBe(0);
  });
});
