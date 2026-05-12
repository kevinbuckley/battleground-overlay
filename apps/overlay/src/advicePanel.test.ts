import { describe, expect, it } from 'bun:test';
import type { Recommendation } from '@overlay/shared';
import { clearAdvice, getAdvice, setAdvice } from './advicePanel';

describe('advicePanel', () => {
  it('getAdvice returns null when no advice is set', () => {
    clearAdvice();
    expect(getAdvice()).toBeNull();
  });

  it('setAdvice stores the recommendation', () => {
    clearAdvice();
    const rec: Recommendation = {
      action: { type: 'Buy' as const, cardId: 'test_123', shopIndex: 0 },
      score: 0.85,
      confidence: 0.9,
      reason: 'triple opportunity',
    };
    setAdvice(rec);
    expect(getAdvice()).toEqual(rec);
  });

  it('clearAdvice resets to null', () => {
    clearAdvice();
    setAdvice({
      action: { type: 'Sell', boardIndex: 1 },
      score: 0.7,
      confidence: 0.75,
      reason: 'weak minion',
    });
    expect(getAdvice()).not.toBeNull();
    clearAdvice();
    expect(getAdvice()).toBeNull();
  });
});
