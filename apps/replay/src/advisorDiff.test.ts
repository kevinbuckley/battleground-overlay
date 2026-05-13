import type { Recommendation } from '@overlay/shared';
import { advisorDiff, formatAction, summarizeDiff } from './advisorDiff';
import type { AdvisorDiff } from './advisorDiff';

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

describe('summarizeDiff', () => {
  it('returns empty string for empty input', () => {
    expect(summarizeDiff([])).toBe('No mismatches');
  });

  it('returns "No mismatches" when all turns match', () => {
    const diffs: AdvisorDiff[] = [
      {
        turn: 1,
        actual: [makeRec({ type: 'Buy', cardId: 'A', shopIndex: 0 }, 0.8)],
        recommended: [makeRec({ type: 'Buy', cardId: 'A', shopIndex: 0 }, 0.8)],
      },
      {
        turn: 2,
        actual: [makeRec({ type: 'TierUp' }, 0.6)],
        recommended: [makeRec({ type: 'TierUp' }, 0.6)],
      },
    ];
    expect(summarizeDiff(diffs)).toBe('No mismatches');
  });

  it('formats mismatched turns with turn number and actions', () => {
    const diffs: AdvisorDiff[] = [
      {
        turn: 3,
        actual: [makeRec({ type: 'Buy', cardId: 'OLD', shopIndex: 0 }, 0.9)],
        recommended: [makeRec({ type: 'Sell', boardIndex: 1 }, 0.7)],
      },
    ];
    const result = summarizeDiff(diffs);
    expect(result).toBe('Turn 3: did Buy OLD (score 0.9), advisor said Sell [1] (score 0.7)');
  });

  it('handles multiple mismatches with multiple matches', () => {
    const diffs: AdvisorDiff[] = [
      {
        turn: 1,
        actual: [makeRec({ type: 'Buy', cardId: 'A', shopIndex: 0 }, 0.8)],
        recommended: [makeRec({ type: 'Buy', cardId: 'A', shopIndex: 0 }, 0.8)],
      },
      {
        turn: 4,
        actual: [makeRec({ type: 'Reroll' }, 0.3)],
        recommended: [makeRec({ type: 'TierUp' }, 0.6)],
      },
      {
        turn: 6,
        actual: [makeRec({ type: 'Freeze' }, 0.5)],
        recommended: [makeRec({ type: 'Buy', cardId: 'B', shopIndex: 0 }, 0.9)],
      },
    ];
    const result = summarizeDiff(diffs);
    const lines = result.split('\n');
    expect(lines).toContain('Turn 4: did Reroll (score 0.3), advisor said TierUp (score 0.6)');
    expect(lines).toContain('Turn 6: did Freeze (score 0.5), advisor said Buy B (score 0.9)');
  });

  it('handles empty actual/recommended arrays in mismatch', () => {
    const diffs: AdvisorDiff[] = [
      {
        turn: 5,
        actual: [],
        recommended: [makeRec({ type: 'TierUp' }, 0.9)],
      },
    ];
    expect(summarizeDiff(diffs)).toBe('Turn 5: did nothing, advisor said TierUp (score 0.9)');
  });
});
