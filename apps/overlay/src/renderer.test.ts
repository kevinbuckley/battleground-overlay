import { describe, expect, it } from 'bun:test';
import type { Recommendation } from '@overlay/shared';
import { formatMinionLine, getActionText, getConfidenceLabel, initRenderer } from './renderer';

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
      onDamage: () => {},
      onBoard: () => {},
      onOpponents: () => {},
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
      onDamage: () => {},
      onBoard: () => {},
      onOpponents: () => {},
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
      onDamage: () => {},
      onBoard: () => {},
      onOpponents: () => {},
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
      onDamage: () => {},
      onBoard: () => {},
      onOpponents: () => {},
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

  it('onDamage updates #damage-forecast textContent with Win: <pct>%', () => {
    let damageCallback: ((f: unknown) => void) | null = null;
    const bridge = {
      onRecs: () => {},
      onExplanation: () => {},
      onDamage: (cb: (f: unknown) => void) => {
        damageCallback = cb;
      },
      onBoard: () => {},
      onOpponents: () => {},
    };

    const mockElements = new Map<string, { textContent: string }>();
    mockElements.set('damage-forecast', { textContent: '' });

    (globalThis as unknown as Record<string, unknown>).document = {
      getElementById(id: string) {
        return mockElements.get(id) || null;
      },
    } as unknown as typeof globalThis.document;

    initRenderer(bridge);
    damageCallback!({ winPct: 0.75 });

    expect((mockElements.get('damage-forecast') as { textContent: string }).textContent).toBe(
      'Win: 75% (0-0 dmg)',
    );

    (globalThis as unknown as Record<string, unknown>).document = undefined;
  });

  it('onDamage is no-op when #damage-forecast element is missing', () => {
    let damageCallback: ((f: unknown) => void) | null = null;
    const bridge = {
      onRecs: () => {},
      onExplanation: () => {},
      onDamage: (cb: (f: unknown) => void) => {
        damageCallback = cb;
      },
      onBoard: () => {},
      onOpponents: () => {},
    };

    const mockElements = new Map<string, { textContent: string }>();

    (globalThis as unknown as Record<string, unknown>).document = {
      getElementById(id: string) {
        return mockElements.get(id) || null;
      },
    } as unknown as typeof globalThis.document;

    initRenderer(bridge);
    damageCallback!({ winPct: 0.5 });

    (globalThis as unknown as Record<string, unknown>).document = undefined;
  });

  it('onDamage shows Win: 0% when winPct is 0', () => {
    let damageCallback: ((f: unknown) => void) | null = null;
    const bridge = {
      onRecs: () => {},
      onExplanation: () => {},
      onDamage: (cb: (f: unknown) => void) => {
        damageCallback = cb;
      },
      onBoard: () => {},
      onOpponents: () => {},
    };

    const mockElements = new Map<string, { textContent: string }>();
    mockElements.set('damage-forecast', { textContent: '' });

    (globalThis as unknown as Record<string, unknown>).document = {
      getElementById(id: string) {
        return mockElements.get(id) || null;
      },
    } as unknown as typeof globalThis.document;

    initRenderer(bridge);
    damageCallback!({ winPct: 0 });

    expect((mockElements.get('damage-forecast') as { textContent: string }).textContent).toBe(
      'Win: 0% (0-0 dmg)',
    );

    (globalThis as unknown as Record<string, unknown>).document = undefined;
  });

  it('onDamage includes min/max dmg in textContent', () => {
    let damageCallback: ((f: unknown) => void) | null = null;
    const bridge = {
      onRecs: () => {},
      onExplanation: () => {},
      onDamage: (cb: (f: unknown) => void) => {
        damageCallback = cb;
      },
      onBoard: () => {},
      onOpponents: () => {},
    };

    const mockElements = new Map<string, { textContent: string }>();
    mockElements.set('damage-forecast', { textContent: '' });

    (globalThis as unknown as Record<string, unknown>).document = {
      getElementById(id: string) {
        return mockElements.get(id) || null;
      },
    } as unknown as typeof globalThis.document;

    initRenderer(bridge);
    damageCallback!({ winPct: 0.7, minDmg: 2, maxDmg: 5 });

    expect((mockElements.get('damage-forecast') as { textContent: string }).textContent).toBe(
      'Win: 70% (2-5 dmg)',
    );

    (globalThis as unknown as Record<string, unknown>).document = undefined;
  });

  it('onDamage falls back to 0 when minDmg/maxDmg are missing', () => {
    let damageCallback: ((f: unknown) => void) | null = null;
    const bridge = {
      onRecs: () => {},
      onExplanation: () => {},
      onDamage: (cb: (f: unknown) => void) => {
        damageCallback = cb;
      },
      onBoard: () => {},
      onOpponents: () => {},
    };

    const mockElements = new Map<string, { textContent: string }>();
    mockElements.set('damage-forecast', { textContent: '' });

    (globalThis as unknown as Record<string, unknown>).document = {
      getElementById(id: string) {
        return mockElements.get(id) || null;
      },
    } as unknown as typeof globalThis.document;

    initRenderer(bridge);
    damageCallback!({ winPct: 0.5 });

    expect((mockElements.get('damage-forecast') as { textContent: string }).textContent).toBe(
      'Win: 50% (0-0 dmg)',
    );

    (globalThis as unknown as Record<string, unknown>).document = undefined;
  });

  it('onBoard updates #board-count textContent with "Minions: N"', () => {
    let boardCallback: ((b: unknown) => void) | null = null;
    const bridge = {
      onRecs: () => {},
      onExplanation: () => {},
      onDamage: () => {},
      onBoard: (cb: (b: unknown) => void) => {
        boardCallback = cb;
      },
      onOpponents: () => {},
    };

    const mockElements = new Map<string, { textContent: string }>();
    mockElements.set('board-count', { textContent: '' });

    (globalThis as unknown as Record<string, unknown>).document = {
      getElementById(id: string) {
        return mockElements.get(id) || null;
      },
    } as unknown as typeof globalThis.document;

    initRenderer(bridge);
    boardCallback!({ minions: ['a', 'b', 'c'] });

    expect((mockElements.get('board-count') as { textContent: string }).textContent).toBe(
      'Minions: 3',
    );

    (globalThis as unknown as Record<string, unknown>).document = undefined;
  });

  it('onBoard is no-op when #board-count element is missing', () => {
    let boardCallback: ((b: unknown) => void) | null = null;
    const bridge = {
      onRecs: () => {},
      onExplanation: () => {},
      onDamage: () => {},
      onBoard: (cb: (b: unknown) => void) => {
        boardCallback = cb;
      },
      onOpponents: () => {},
    };

    const mockElements = new Map<string, { textContent: string }>();

    (globalThis as unknown as Record<string, unknown>).document = {
      getElementById(id: string) {
        return mockElements.get(id) || null;
      },
    } as unknown as typeof globalThis.document;

    initRenderer(bridge);
    boardCallback!({ minions: ['a', 'b'] });

    (globalThis as unknown as Record<string, unknown>).document = undefined;
  });

  it('onBoard shows "Minions: 0" when minions array is empty', () => {
    let boardCallback: ((b: unknown) => void) | null = null;
    const bridge = {
      onRecs: () => {},
      onExplanation: () => {},
      onDamage: () => {},
      onBoard: (cb: (b: unknown) => void) => {
        boardCallback = cb;
      },
      onOpponents: () => {},
    };

    const mockElements = new Map<string, { textContent: string }>();
    mockElements.set('board-count', { textContent: '' });
    mockElements.set('board-best-attack', { textContent: '' });

    (globalThis as unknown as Record<string, unknown>).document = {
      getElementById(id: string) {
        return mockElements.get(id) || null;
      },
    } as unknown as typeof globalThis.document;

    initRenderer(bridge);
    boardCallback!({ minions: [] });

    expect((mockElements.get('board-count') as { textContent: string }).textContent).toBe(
      'Minions: 0',
    );
    expect((mockElements.get('board-best-attack') as { textContent: string }).textContent).toBe('');

    (globalThis as unknown as Record<string, unknown>).document = undefined;
  });

  it('onBoard writes best minion to #board-best-attack', () => {
    let boardCallback: ((b: unknown) => void) | null = null;
    const bridge = {
      onRecs: () => {},
      onExplanation: () => {},
      onDamage: () => {},
      onBoard: (cb: (b: unknown) => void) => {
        boardCallback = cb;
      },
      onOpponents: () => {},
    };

    const mockElements = new Map<string, { textContent: string }>();
    mockElements.set('board-count', { textContent: '' });
    mockElements.set('board-best-attack', { textContent: '' });

    (globalThis as unknown as Record<string, unknown>).document = {
      getElementById(id: string) {
        return mockElements.get(id) || null;
      },
    } as unknown as typeof globalThis.document;

    initRenderer(bridge);
    boardCallback!({
      minions: [
        { attack: 3, health: 4, cardId: 'TB_GolgBos_04' },
        { attack: 5, health: 2, cardId: 'TB_GolgBos_05' },
      ],
    });

    expect((mockElements.get('board-best-attack') as { textContent: string }).textContent).toBe(
      'Best: 5/2',
    );

    (globalThis as unknown as Record<string, unknown>).document = undefined;
  });

  it('onOpponents updates #opponent-count textContent with "Opponents: N"', () => {
    let opponentsCallback: ((o: unknown[]) => void) | null = null;
    const bridge = {
      onRecs: () => {},
      onExplanation: () => {},
      onDamage: () => {},
      onBoard: () => {},
      onOpponents: (cb: (o: unknown[]) => void) => {
        opponentsCallback = cb;
      },
    };

    const mockElements = new Map<string, { textContent: string }>();
    mockElements.set('opponent-count', { textContent: '' });

    (globalThis as unknown as Record<string, unknown>).document = {
      getElementById(id: string) {
        return mockElements.get(id) || null;
      },
    } as unknown as typeof globalThis.document;

    initRenderer(bridge);
    opponentsCallback!([
      { entityId: 1, hp: 30, tier: 3, eliminated: false },
      { entityId: 2, hp: 15, tier: 5, eliminated: false },
    ]);

    expect((mockElements.get('opponent-count') as { textContent: string }).textContent).toBe(
      'Opponents: 2',
    );

    (globalThis as unknown as Record<string, unknown>).document = undefined;
  });

  it('onOpponents is no-op when #opponent-count element is missing', () => {
    const bridge = {
      onRecs: () => {},
      onExplanation: () => {},
      onDamage: () => {},
      onBoard: () => {},
      onOpponents: () => {},
    };

    const mockElements = new Map<string, { textContent: string }>();

    (globalThis as unknown as Record<string, unknown>).document = {
      getElementById(id: string) {
        return mockElements.get(id) || null;
      },
    } as unknown as typeof globalThis.document;

    initRenderer(bridge);

    (globalThis as unknown as Record<string, unknown>).document = undefined;
  });

  it('onOpponents shows "Opponents: 0" when array is empty', () => {
    let opponentsCallback: ((o: unknown[]) => void) | null = null;
    const bridge = {
      onRecs: () => {},
      onExplanation: () => {},
      onDamage: () => {},
      onBoard: () => {},
      onOpponents: (cb: (o: unknown[]) => void) => {
        opponentsCallback = cb;
      },
    };

    const mockElements = new Map<string, { textContent: string }>();
    mockElements.set('opponent-count', { textContent: '' });

    (globalThis as unknown as Record<string, unknown>).document = {
      getElementById(id: string) {
        return mockElements.get(id) || null;
      },
    } as unknown as typeof globalThis.document;

    initRenderer(bridge);
    opponentsCallback!([]);

    expect((mockElements.get('opponent-count') as { textContent: string }).textContent).toBe(
      'Opponents: 0',
    );

    (globalThis as unknown as Record<string, unknown>).document = undefined;
  });

  it('onOpponents writes "Alive: N/total" to #opponent-alive', () => {
    let opponentsCallback: ((o: unknown[]) => void) | null = null;
    const bridge = {
      onRecs: () => {},
      onExplanation: () => {},
      onDamage: () => {},
      onBoard: () => {},
      onOpponents: (cb: (o: unknown[]) => void) => {
        opponentsCallback = cb;
      },
    };

    const mockElements = new Map<string, { textContent: string }>();
    mockElements.set('opponent-count', { textContent: '' });
    mockElements.set('opponent-alive', { textContent: '' });

    (globalThis as unknown as Record<string, unknown>).document = {
      getElementById(id: string) {
        return mockElements.get(id) || null;
      },
    } as unknown as typeof globalThis.document;

    initRenderer(bridge);
    opponentsCallback!([
      { eliminated: false },
      { eliminated: false },
      { eliminated: false },
      { eliminated: true },
      { eliminated: true },
    ]);

    expect((mockElements.get('opponent-alive') as { textContent: string }).textContent).toBe(
      'Alive: 3/5',
    );

    (globalThis as unknown as Record<string, unknown>).document = undefined;
  });

  it('onOpponents shows "Alive: 0/total" when all eliminated', () => {
    let opponentsCallback: ((o: unknown[]) => void) | null = null;
    const bridge = {
      onRecs: () => {},
      onExplanation: () => {},
      onDamage: () => {},
      onBoard: () => {},
      onOpponents: (cb: (o: unknown[]) => void) => {
        opponentsCallback = cb;
      },
    };

    const mockElements = new Map<string, { textContent: string }>();
    mockElements.set('opponent-count', { textContent: '' });
    mockElements.set('opponent-alive', { textContent: '' });

    (globalThis as unknown as Record<string, unknown>).document = {
      getElementById(id: string) {
        return mockElements.get(id) || null;
      },
    } as unknown as typeof globalThis.document;

    initRenderer(bridge);
    opponentsCallback!([{ eliminated: true }, { eliminated: true }, { eliminated: true }]);

    expect((mockElements.get('opponent-alive') as { textContent: string }).textContent).toBe(
      'Alive: 0/3',
    );

    (globalThis as unknown as Record<string, unknown>).document = undefined;
  });

  it('onRecs populates up to 3 <li> in #advice-list', () => {
    let recsCallback: ((r: unknown[]) => void) | null = null;
    const bridge = {
      onRecs: (cb: (r: unknown[]) => void) => {
        recsCallback = cb;
      },
      onExplanation: () => {},
      onDamage: () => {},
      onBoard: () => {},
      onOpponents: () => {},
    };

    const mockElements = new Map<
      string,
      { textContent: string; innerHTML: string; children: unknown[] }
    >();
    mockElements.set('advice-action', { textContent: '', innerHTML: '', children: [] });
    mockElements.set('advice-reason', { textContent: '', innerHTML: '', children: [] });
    mockElements.set('advice-list', { textContent: '', innerHTML: '', children: [] });

    (globalThis as unknown as Record<string, unknown>).document = {
      getElementById(id: string) {
        return mockElements.get(id) || null;
      },
    } as unknown as typeof globalThis.document;

    initRenderer(bridge);

    const recs = [
      makeBuyRec('TB_GolgBos_04'),
      makeBuyRec('TB_GolgBos_05'),
      makeBuyRec('TB_GolgBos_06'),
    ];
    recsCallback!(recs);

    const listEl = mockElements.get('advice-list') as { innerHTML: string };
    expect(listEl.innerHTML).toContain('Buy TB_GolgBos_04');
    expect(listEl.innerHTML).toContain('Buy TB_GolgBos_05');
    expect(listEl.innerHTML).toContain('Buy TB_GolgBos_06');

    (globalThis as unknown as Record<string, unknown>).document = undefined;
  });

  it('onRecs caps to 3 <li> when 5 recs provided', () => {
    let recsCallback: ((r: unknown[]) => void) | null = null;
    const bridge = {
      onRecs: (cb: (r: unknown[]) => void) => {
        recsCallback = cb;
      },
      onExplanation: () => {},
      onDamage: () => {},
      onBoard: () => {},
      onOpponents: () => {},
    };

    const mockElements = new Map<
      string,
      { textContent: string; innerHTML: string; children: unknown[] }
    >();
    mockElements.set('advice-action', { textContent: '', innerHTML: '', children: [] });
    mockElements.set('advice-reason', { textContent: '', innerHTML: '', children: [] });
    mockElements.set('advice-list', { textContent: '', innerHTML: '', children: [] });

    (globalThis as unknown as Record<string, unknown>).document = {
      getElementById(id: string) {
        return mockElements.get(id) || null;
      },
    } as unknown as typeof globalThis.document;

    initRenderer(bridge);

    const recs = [
      makeBuyRec('A'),
      makeBuyRec('B'),
      makeBuyRec('C'),
      makeBuyRec('D'),
      makeBuyRec('E'),
    ];
    recsCallback!(recs);

    const listEl = mockElements.get('advice-list') as { innerHTML: string };
    expect(listEl.innerHTML).toContain('Buy A');
    expect(listEl.innerHTML).toContain('Buy B');
    expect(listEl.innerHTML).toContain('Buy C');
    expect(listEl.innerHTML).not.toContain('Buy D');
    expect(listEl.innerHTML).not.toContain('Buy E');

    (globalThis as unknown as Record<string, unknown>).document = undefined;
  });

  it('onRecs with 1 rec creates 1 <li>', () => {
    let recsCallback: ((r: unknown[]) => void) | null = null;
    const bridge = {
      onRecs: (cb: (r: unknown[]) => void) => {
        recsCallback = cb;
      },
      onExplanation: () => {},
      onDamage: () => {},
      onBoard: () => {},
      onOpponents: () => {},
    };

    const mockElements = new Map<
      string,
      { textContent: string; innerHTML: string; children: unknown[] }
    >();
    mockElements.set('advice-action', { textContent: '', innerHTML: '', children: [] });
    mockElements.set('advice-reason', { textContent: '', innerHTML: '', children: [] });
    mockElements.set('advice-list', { textContent: '', innerHTML: '', children: [] });

    (globalThis as unknown as Record<string, unknown>).document = {
      getElementById(id: string) {
        return mockElements.get(id) || null;
      },
    } as unknown as typeof globalThis.document;

    initRenderer(bridge);

    recsCallback!([makeBuyRec('TB_GolgBos_04')]);

    const listEl = mockElements.get('advice-list') as { innerHTML: string };
    expect(listEl.innerHTML).toContain('Buy TB_GolgBos_04');
    expect(listEl.innerHTML.split('Buy').length - 1).toBe(1);

    (globalThis as unknown as Record<string, unknown>).document = undefined;
  });

  it('onRecs sets confidence percentage on #advice-confidence', () => {
    let recsCallback: ((r: unknown[]) => void) | null = null;
    const bridge = {
      onRecs: (cb: (r: unknown[]) => void) => {
        recsCallback = cb;
      },
      onExplanation: () => {},
      onDamage: () => {},
      onBoard: () => {},
      onOpponents: () => {},
    };

    const mockElements = new Map<string, { textContent: string }>();
    mockElements.set('advice-action', { textContent: '' });
    mockElements.set('advice-reason', { textContent: '' });
    mockElements.set('advice-confidence', { textContent: '' });

    (globalThis as unknown as Record<string, unknown>).document = {
      getElementById(id: string) {
        return mockElements.get(id) || null;
      },
    } as unknown as typeof globalThis.document;

    initRenderer(bridge);

    const rec = makeBuyRec('TB_GolgBos_04');
    (rec as { confidence: number }).confidence = 0.84;
    recsCallback!([rec]);

    expect((mockElements.get('advice-confidence') as { textContent: string }).textContent).toBe(
      '84%',
    );

    (globalThis as unknown as Record<string, unknown>).document = undefined;
  });

  it('onRecs sets "0%" when confidence is 0', () => {
    let recsCallback: ((r: unknown[]) => void) | null = null;
    const bridge = {
      onRecs: (cb: (r: unknown[]) => void) => {
        recsCallback = cb;
      },
      onExplanation: () => {},
      onDamage: () => {},
      onBoard: () => {},
      onOpponents: () => {},
    };

    const mockElements = new Map<string, { textContent: string }>();
    mockElements.set('advice-action', { textContent: '' });
    mockElements.set('advice-reason', { textContent: '' });
    mockElements.set('advice-confidence', { textContent: '' });

    (globalThis as unknown as Record<string, unknown>).document = {
      getElementById(id: string) {
        return mockElements.get(id) || null;
      },
    } as unknown as typeof globalThis.document;

    initRenderer(bridge);

    const rec = makeBuyRec('TB_GolgBos_04');
    (rec as { confidence: number }).confidence = 0;
    recsCallback!([rec]);

    expect((mockElements.get('advice-confidence') as { textContent: string }).textContent).toBe(
      '0%',
    );

    (globalThis as unknown as Record<string, unknown>).document = undefined;
  });
});

describe('getConfidenceLabel', () => {
  it('returns "high" when c >= 0.7', () => {
    expect(getConfidenceLabel(0.9)).toBe('high');
    expect(getConfidenceLabel(0.7)).toBe('high');
  });

  it('returns "medium" when c >= 0.4 and < 0.7', () => {
    expect(getConfidenceLabel(0.5)).toBe('medium');
    expect(getConfidenceLabel(0.4)).toBe('medium');
  });

  it('returns "low" when c < 0.4', () => {
    expect(getConfidenceLabel(0.2)).toBe('low');
    expect(getConfidenceLabel(0)).toBe('low');
  });
});

describe('formatMinionLine', () => {
  it('returns "attack/health cardId" format', () => {
    expect(formatMinionLine({ attack: 3, health: 4, cardId: 'X' })).toBe('`3/4 X`');
  });

  it('handles empty cardId with trailing space', () => {
    expect(formatMinionLine({ attack: 0, health: 1, cardId: '' })).toBe('`0/1 `');
  });
});
