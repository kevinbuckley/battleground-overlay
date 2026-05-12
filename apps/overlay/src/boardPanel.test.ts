import { describe, expect, it } from 'bun:test';
import type { Recommendation } from '@overlay/shared';
import { clearBoardPanel, getBoardPanel, setBoardPanel } from '@overlay/shared';

describe('boardPanel', () => {
  it('getBoardPanel returns null recommendation when nothing is set', () => {
    clearBoardPanel();
    expect(getBoardPanel().recommendation).toBeNull();
  });

  it('setBoardPanel stores the recommendation', () => {
    clearBoardPanel();
    const rec: Recommendation = {
      action: { type: 'Reposition', fromIndex: 0, toIndex: 2 },
      score: 0.92,
      confidence: 0.88,
      reason: 'best position against current board',
    };
    setBoardPanel({ recommendation: rec });
    expect(getBoardPanel().recommendation).toEqual(rec);
  });

  it('clearBoardPanel resets to null', () => {
    clearBoardPanel();
    setBoardPanel({
      recommendation: {
        action: { type: 'Buy', cardId: 'test_456', shopIndex: 1 },
        score: 0.6,
        confidence: 0.7,
        reason: 'good value',
      },
    });
    expect(getBoardPanel().recommendation).not.toBeNull();
    clearBoardPanel();
    expect(getBoardPanel().recommendation).toBeNull();
  });
});
