import { initialState } from '@overlay/state';
import {
  clamp,
  hpBucket,
  isShoppingPhase,
  lerp,
  minionsOnBoard,
  opponentMinionsOnBoard,
  round2,
  shopMinionCount,
} from './utils';

describe('clamp', () => {
  test('returns lo when below range', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  test('returns hi when above range', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  test('returns n when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });
});

describe('lerp', () => {
  test('returns a when t is 0', () => {
    expect(lerp(10, 20, 0)).toBe(10);
  });

  test('returns b when t is 1', () => {
    expect(lerp(10, 20, 1)).toBe(20);
  });

  test('interpolates at t=0.5', () => {
    expect(lerp(10, 30, 0.5)).toBe(20);
  });
});

describe('round2', () => {
  test('rounds 3.14159 to 3.14', () => {
    expect(round2(3.14159)).toBe(3.14);
  });

  test('rounds 2.005 to 2.01 (IEEE 754)', () => {
    expect(round2(2.005)).toBe(2.01);
  });
});

describe('isShoppingPhase', () => {
  test('returns true when phase is shopping', () => {
    const state = initialState();
    expect(isShoppingPhase({ ...state, phase: 'shopping' })).toBe(true);
  });

  test('returns false when phase is combat', () => {
    const state = initialState();
    expect(isShoppingPhase({ ...state, phase: 'combat' })).toBe(false);
  });
});

describe('hpBucket', () => {
  test('returns critical when hp < 6', () => {
    expect(hpBucket(0)).toBe('critical');
    expect(hpBucket(5)).toBe('critical');
  });

  test('returns low when 6 <= hp < 15', () => {
    expect(hpBucket(6)).toBe('low');
    expect(hpBucket(14)).toBe('low');
  });

  test('returns safe when hp >= 15', () => {
    expect(hpBucket(15)).toBe('safe');
    expect(hpBucket(40)).toBe('safe');
  });
});

describe('minionsOnBoard', () => {
  test('returns 0 when board is empty', () => {
    expect(minionsOnBoard(initialState())).toBe(0);
  });

  test('returns correct count for 3 minions', () => {
    const state = initialState();
    state.player.board.minions = [
      { entityId: 1, cardId: 'test1' },
      { entityId: 2, cardId: 'test2' },
      { entityId: 3, cardId: 'test3' },
    ];
    expect(minionsOnBoard(state)).toBe(3);
  });
});

describe('opponentMinionsOnBoard', () => {
  test('returns 0 when opponent board is empty', () => {
    const state = initialState();
    state.opponents = [{ ...state.opponents[0], board: { minions: [] } }];
    expect(opponentMinionsOnBoard(state, 0)).toBe(0);
  });

  test('returns 0 when index is out of range', () => {
    const state = initialState();
    expect(opponentMinionsOnBoard(state, 5)).toBe(0);
  });
});

describe('shopMinionCount', () => {
  test('returns 0 when shop is empty', () => {
    expect(shopMinionCount(initialState())).toBe(0);
  });

  test('returns correct count for 3 shop minions', () => {
    const state = initialState();
    state.player.shop.minions = [
      { entityId: 10, cardId: 'test1' },
      { entityId: 11, cardId: 'test2' },
      { entityId: 12, cardId: 'test3' },
    ];
    expect(shopMinionCount(state)).toBe(3);
  });
});
