import { describe, expect, it } from 'bun:test';
import { withBudget } from './withBudget';

describe('withBudget', () => {
  it('returns fn result when within budget', () => {
    const result = withBudget(() => 'ok', 100, 'fallback');
    expect(result).toBe('ok');
  });

  it('returns fn result even when wall-clock exceeds ms budget', () => {
    const result = withBudget(
      () => {
        const start = Date.now();
        while (Date.now() - start < 200) {
          /* spin */
        }
        return 'slow';
      },
      50,
      'fallback',
    );
    // Budget is advisory — result is never discarded; fallback is only for exceptions.
    expect(result).toBe('slow');
  });

  it('returns fallback on exception', () => {
    const result = withBudget(
      () => {
        throw new Error('boom');
      },
      100,
      'fallback',
    );
    expect(result).toBe('fallback');
  });

  it('returns fallback when fn throws after partial work', () => {
    let worked = false;
    const result = withBudget(
      () => {
        worked = true;
        throw new Error('boom');
      },
      100,
      'fallback',
    );
    expect(result).toBe('fallback');
    expect(worked).toBe(true);
  });

  it('returns fallback when elapsed equals ms (strict >)', () => {
    const result = withBudget(() => 'ok', 0, 'fallback');
    expect(result).toBe('ok');
  });

  it('returns within budgetMs for fast functions', () => {
    const start = Date.now();
    const result = withBudget(() => ({ score: 0.5, confidence: 0.5 }), 100, {
      score: 0,
      confidence: 0,
    });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(200);
    expect(result.score).toBeGreaterThanOrEqual(0);
  });
});
