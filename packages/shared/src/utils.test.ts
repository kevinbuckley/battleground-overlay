import { initialState } from '@overlay/state';
import { clamp, hpBucket, isShoppingPhase, lerp, round2 } from './utils';

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
