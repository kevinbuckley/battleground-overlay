import { describe, expect, it } from 'bun:test';
import type { Recommendation } from './recommendation';
import { formatRecommendation } from './recommendation';

function makeRec(action: Recommendation['action']): Recommendation {
  return { action, score: 0.72, confidence: 0.8, reason: 'test' };
}

describe('formatRecommendation', () => {
  it('formats a Buy action', () => {
    const rec = makeRec({ type: 'Buy', cardId: 'TB_GoDS_01', shopIndex: 0 });
    expect(formatRecommendation(rec)).toBe('Buy TB_GoDS_01 (score: 0.72)');
  });

  it('formats a Sell action', () => {
    const rec = makeRec({ type: 'Sell', boardIndex: 2 });
    expect(formatRecommendation(rec)).toBe('Sell position 2 (score: 0.72)');
  });

  it('formats a Freeze action', () => {
    const rec = makeRec({ type: 'Freeze' });
    expect(formatRecommendation(rec)).toBe('Freeze shop (score: 0.72)');
  });

  it('formats a Reroll action', () => {
    const rec = makeRec({ type: 'Reroll' });
    expect(formatRecommendation(rec)).toBe('Reroll (score: 0.72)');
  });

  it('formats a TierUp action', () => {
    const rec = makeRec({ type: 'TierUp' });
    expect(formatRecommendation(rec)).toBe('Tier up (score: 0.72)');
  });

  it('formats a Reposition action', () => {
    const rec = makeRec({ type: 'Reposition', fromIndex: 1, toIndex: 3 });
    expect(formatRecommendation(rec)).toBe('Reposition 1→3 (score: 0.72)');
  });

  it('rounds score to 2 decimal places', () => {
    const rec: Recommendation = {
      action: { type: 'Buy', cardId: 'X', shopIndex: 0 },
      score: 0.123456,
      confidence: 0.5,
      reason: '',
    };
    expect(formatRecommendation(rec)).toContain('0.12');
  });
});
