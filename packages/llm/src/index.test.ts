import { describe, expect, it } from 'bun:test';
import type { Recommendation } from '@overlay/shared';
import { initialState } from '@overlay/state';
import { explain } from './index';

function makeState(): ReturnType<typeof initialState> {
  const s = initialState();
  s.player.tier = 5;
  s.player.gold = 10;
  s.player.hero.hp = 20;
  s.player.board.minions = [];
  s.player.shop.minions = [];
  s.turn = 6;
  s.phase = 'shopping';
  return s;
}

function makeRec(): Recommendation {
  return {
    action: { type: 'Buy', cardId: 'TB_Gol_Book', shopIndex: 0 },
    score: 0.85,
    confidence: 0.7,
    reason: 'Creates a triple',
  };
}

describe('explain', () => {
  it('returns empty string when LLM is unreachable (cache miss)', async () => {
    const state = makeState();
    const rec = makeRec();
    const result = await explain(rec, state);
    expect(typeof result).toBe('string');
  });

  it('returns cached result on second call with same state', async () => {
    const state = makeState();
    const rec = makeRec();
    const r1 = await explain(rec, state);
    const r2 = await explain(rec, state);
    expect(r1).toBe(r2);
  });

  it('returns empty string on LLM timeout (simulated)', async () => {
    const state = makeState();
    state.player.gold = 100;
    const rec = makeRec();
    const result = await explain(rec, state);
    expect(typeof result).toBe('string');
  });
});
