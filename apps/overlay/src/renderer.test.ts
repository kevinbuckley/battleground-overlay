import { describe, expect, it } from 'bun:test';
import type { Recommendation } from '@overlay/shared';
import { getActionText, initRenderer } from './renderer';

function makeBuyRec(cardId: string): Recommendation {
  return {
    action: { type: 'Buy', cardId, shopIndex: 0 },
    score: 0.8,
    confidence: 0.7,
    reason: 'good triple',
  };
}

describe('getActionText', () => {
  it('returns "Buy <cardId>" for BuyAction', () => {
    const rec = makeBuyRec('TB_GolgBos_04');
    expect(getActionText(rec)).toBe('Buy TB_GolgBos_04');
  });

  it('returns "Sell #<index>" for SellAction', () => {
    const rec = makeBuyRec('') as Recommendation & { action: { type: 'Sell'; boardIndex: number } };
    (rec.action as { type: 'Sell'; boardIndex: number }).type = 'Sell';
    (rec.action as { type: 'Sell'; boardIndex: number }).boardIndex = 2;
    expect(getActionText(rec)).toBe('Sell #2');
  });

  it('returns "Freeze shop" for FreezeAction', () => {
    const rec = makeBuyRec('') as Recommendation & { action: { type: 'Freeze' } };
    (rec.action as { type: 'Freeze' }).type = 'Freeze';
    expect(getActionText(rec)).toBe('Freeze shop');
  });

  it('returns "Reroll shop" for RerollAction', () => {
    const rec = makeBuyRec('') as Recommendation & { action: { type: 'Reroll' } };
    (rec.action as { type: 'Reroll' }).type = 'Reroll';
    expect(getActionText(rec)).toBe('Reroll shop');
  });

  it('returns "Tier up" for TierUpAction', () => {
    const rec = makeBuyRec('') as Recommendation & { action: { type: 'TierUp' } };
    (rec.action as { type: 'TierUp' }).type = 'TierUp';
    expect(getActionText(rec)).toBe('Tier up');
  });

  it('returns "Reposition #<from> → #<to>" for RepositionAction', () => {
    const rec = makeBuyRec('') as Recommendation & {
      action: { type: 'Reposition'; fromIndex: number; toIndex: number };
    };
    (rec.action as { type: 'Reposition'; fromIndex: number; toIndex: number }).type = 'Reposition';
    (rec.action as { type: 'Reposition'; fromIndex: number; toIndex: number }).fromIndex = 1;
    (rec.action as { type: 'Reposition'; fromIndex: number; toIndex: number }).toIndex = 3;
    expect(getActionText(rec)).toBe('Reposition #1 → #3');
  });
});

describe('initRenderer', () => {
  it('onRecs updates action text for top recommendation', () => {
    let recsCallback: ((r: unknown[]) => void) | null = null;
    const bridge = {
      onRecs: (cb: (r: unknown[]) => void) => {
        recsCallback = cb;
      },
      onExplanation: () => {},
    };

    const mockElements = new Map<string, { textContent: string; classList: Set<string> }>();
    mockElements.set('advice-action', { textContent: '', classList: new Set() });
    mockElements.set('advice-reason', { textContent: '', classList: new Set() });
    mockElements.set('explanation', { textContent: '', classList: new Set() });

    (globalThis as unknown as Record<string, unknown>).document = {
      getElementById(id: string) {
        return mockElements.get(id) || null;
      },
    } as unknown as typeof globalThis.document;

    initRenderer(bridge);

    const recs = [makeBuyRec('TB_GolgBos_04')];
    recsCallback!(recs);

    expect((mockElements.get('advice-action') as { textContent: string }).textContent).toBe(
      'Buy TB_GolgBos_04',
    );
    expect((mockElements.get('advice-reason') as { textContent: string }).textContent).toBe(
      'good triple',
    );

    (globalThis as unknown as Record<string, unknown>).document = undefined;
  });

  it('onRecs sets "—" when no recommendations', () => {
    let recsCallback: ((r: unknown[]) => void) | null = null;
    const bridge = {
      onRecs: (cb: (r: unknown[]) => void) => {
        recsCallback = cb;
      },
      onExplanation: () => {},
    };

    const mockElements = new Map<string, { textContent: string; classList: Set<string> }>();
    mockElements.set('advice-action', { textContent: '', classList: new Set() });
    mockElements.set('advice-reason', { textContent: '', classList: new Set() });
    mockElements.set('explanation', { textContent: '', classList: new Set() });

    (globalThis as unknown as Record<string, unknown>).document = {
      getElementById(id: string) {
        return mockElements.get(id) || null;
      },
    } as unknown as typeof globalThis.document;

    initRenderer(bridge);
    recsCallback!([]);

    expect((mockElements.get('advice-action') as { textContent: string }).textContent).toBe('—');
    expect((mockElements.get('advice-reason') as { textContent: string }).textContent).toBe('');

    (globalThis as unknown as Record<string, unknown>).document = undefined;
  });

  it('onExplanation shows explanation when non-empty', () => {
    let explanationCallback: ((t: string) => void) | null = null;
    const bridge = {
      onRecs: () => {},
      onExplanation: (cb: (t: string) => void) => {
        explanationCallback = cb;
      },
    };

    const mockElements = new Map<string, { textContent: string; classList: Set<string> }>();
    mockElements.set('advice-action', { textContent: '', classList: new Set() });
    mockElements.set('advice-reason', { textContent: '', classList: new Set() });
    mockElements.set('explanation', { textContent: '', classList: new Set() });

    (globalThis as unknown as Record<string, unknown>).document = {
      getElementById(id: string) {
        return mockElements.get(id) || null;
      },
    } as unknown as typeof globalThis.document;

    initRenderer(bridge);
    explanationCallback!('This is why I recommend buying.');

    const expEl = mockElements.get('explanation') as {
      textContent: string;
      classList: Set<string>;
    };
    expect(expEl.textContent).toBe('This is why I recommend buying.');
    expect(expEl.classList.has('visible')).toBe(true);

    (globalThis as unknown as Record<string, unknown>).document = undefined;
  });

  it('onExplanation hides explanation when empty string', () => {
    let explanationCallback: ((t: string) => void) | null = null;
    const bridge = {
      onRecs: () => {},
      onExplanation: (cb: (t: string) => void) => {
        explanationCallback = cb;
      },
    };

    const mockElements = new Map<string, { textContent: string; classList: Set<string> }>();
    mockElements.set('advice-action', { textContent: '', classList: new Set() });
    mockElements.set('advice-reason', { textContent: '', classList: new Set() });
    const expClassList = new Set(['visible']);
    const expEl = {
      textContent: 'old text',
      classList: {
        has: (c: string) => expClassList.has(c),
        add: (c: string) => expClassList.add(c),
        remove: (c: string) => expClassList.delete(c),
      },
    };
    mockElements.set('explanation', expEl);

    (globalThis as unknown as Record<string, unknown>).document = {
      getElementById(id: string) {
        return mockElements.get(id) || null;
      },
    } as unknown as typeof globalThis.document;

    initRenderer(bridge);
    explanationCallback!('');

    expect(expEl.textContent).toBe('');
    expect(expClassList.has('visible')).toBe(false);

    (globalThis as unknown as Record<string, unknown>).document = undefined;
  });
});
