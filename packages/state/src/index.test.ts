import { describe, expect, it } from 'bun:test';
import { applyEvent } from './index';

describe('applyEvent', () => {
  it('returns state unchanged', () => {
    const state = { turn: 0 };
    expect(applyEvent(state, null)).toBe(state);
  });
});
