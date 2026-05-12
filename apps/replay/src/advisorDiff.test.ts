import type { Recommendation } from '@overlay/shared';
import { advisorDiff, formatAction } from './advisorDiff';

function makeRec(
  action: Recommendation['action'],
  score = 0.5,
  confidence = 0.8,
  reason = '',
): Recommendation {
  return { action, score, confidence, reason };
}

describe('formatAction', () => {
  it('formats a Buy action with cardId', () => {
    const rec = makeRec({ type: 'Buy', cardId: 'CSW_Quick', shopIndex: 0 });
    expect(formatAction(rec)).toBe('Buy CSW_Quick (score 0.5)');
  });

  it('formats a Buy with rounded score', () => {
    const rec = makeRec({ type: 'Buy', cardId: 'TEST', shopIndex: 1 }, 0.888);
    expect(formatAction(rec)).toBe('Buy TEST (score 0.9)');
  });

  it('formats a Sell action', () => {
    const rec = makeRec({ type: 'Sell', boardIndex: 2 });
    expect(formatAction(rec)).toBe('Sell [2] (score 0.5)');
  });

  it('formats a Freeze action', () => {
    const rec = makeRec({ type: 'Freeze' });
    expect(formatAction(rec)).toBe('Freeze (score 0.5)');
  });

  it('formats a Reroll action', () => {
    const rec = makeRec({ type: 'Reroll' });
    expect(formatAction(rec)).toBe('Reroll (score 0.5)');
  });

  it('formats a TierUp action', () => {
    const rec = makeRec({ type: 'TierUp' });
    expect(formatAction(rec)).toBe('TierUp (score 0.5)');
  });

  it('formats a Reposition action', () => {
    const rec = makeRec({
      type: 'Reposition',
      fromIndex: 0,
      toIndex: 2,
    });
    expect(formatAction(rec)).toBe('Reposition [0→2] (score 0.5)');
  });
});

describe('advisorDiff', () => {
  it('returns empty string for two empty arrays', () => {
    expect(advisorDiff([], [])).toBe('');
  });

  it('returns empty string when actual and predicted are identical', () => {
    const recs: Recommendation[] = [
      makeRec({ type: 'Buy', cardId: 'A', shopIndex: 0 }, 0.8),
      makeRec({ type: 'Sell', boardIndex: 1 }, 0.3),
    ];
    expect(advisorDiff(recs, recs)).toBe('');
  });

  it('shows removed recommendations with "-" prefix', () => {
    const actual = [makeRec({ type: 'Buy', cardId: 'OLD', shopIndex: 0 }, 0.9)];
    const predicted: Recommendation[] = [];
    const result = advisorDiff(actual, predicted);
    expect(result).toBe('- Buy OLD (score 0.9)');
  });

  it('shows added recommendations with "+" prefix', () => {
    const actual: Recommendation[] = [];
    const predicted = [makeRec({ type: 'TierUp' }, 0.7)];
    const result = advisorDiff(actual, predicted);
    expect(result).toBe('+ TierUp (score 0.7)');
  });

  it('shows both additions and removals', () => {
    const actual = [
      makeRec({ type: 'Buy', cardId: 'X', shopIndex: 0 }, 0.8),
      makeRec({ type: 'Sell', boardIndex: 0 }, 0.4),
    ];
    const predicted = [
      makeRec({ type: 'Buy', cardId: 'Y', shopIndex: 1 }, 0.6),
      makeRec({ type: 'Sell', boardIndex: 0 }, 0.4),
    ];
    const result = advisorDiff(actual, predicted);
    const lines = result.split('\n');
    expect(lines).toContain('- Buy X (score 0.8)');
    expect(lines).toContain('+ Buy Y (score 0.6)');
  });

  it('handles duplicate recommendations by set deduplication', () => {
    const rec = makeRec({ type: 'Buy', cardId: 'A', shopIndex: 0 }, 0.5);
    const result = advisorDiff([rec, rec], [rec]);
    expect(result).toBe('');
  });
});
