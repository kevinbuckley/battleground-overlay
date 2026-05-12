import { describe, expect, it } from 'bun:test';
import { withBudget } from './withBudget';

describe('withBudget', () => {
  it('returns fn result when within budget', () => {
    const result = withBudget(() => 'ok', 100, 'fallback');
    expect(result).toBe('ok');
  });

  it('returns fallback when wall-clock exceeds ms', () => {
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
    expect(result).toBe('fallback');
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
});
