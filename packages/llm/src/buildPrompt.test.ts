import { describe, expect, it } from 'bun:test';
import type { GameState, Recommendation } from '@overlay/shared';
import { buildExplainPrompt } from './buildPrompt';

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    turn: 5,
    phase: 'shopping',
    player: {
      entityId: 1,
      playerId: 1,
      hero: { entityId: 1, cardId: 'Hero_01', hp: 30, armor: 0 },
      board: { minions: [] },
      shop: { minions: [], frozen: false, rollCost: 2 },
      gold: 8,
      tier: 5,
      tierUpCost: 4,
      eliminated: false,
      entityRegistry: new Map(),
    },
    opponents: [
      {
        entityId: 2,
        playerId: 2,
        hero: { entityId: 2, cardId: 'Hero_02', hp: 25, armor: 0 },
        board: { minions: [] },
        tier: 4,
        eliminated: false,
      },
    ],
    ...overrides,
  };
}

function makeRec(overrides: Partial<Recommendation> = {}): Recommendation {
  return {
    action: { type: 'Buy', cardId: 'Minion_123', shopIndex: 0 },
    score: 0.85,
    confidence: 0.7,
    reason: 'Strong tribe synergy',
    ...overrides,
  };
}

function expectUserContent(
  messages: readonly { role: string; content: string }[],
  expected: string,
): void {
  expect(messages.length).toBe(2);
  const [sys, usr] = messages as readonly [(typeof messages)[0], (typeof messages)[1]];
  expect(sys.role).toBe('system');
  expect(usr.role).toBe('user');
  expect(usr.content).toContain(expected);
}

describe('buildExplainPrompt', () => {
  it('returns system + user messages for a Buy recommendation', () => {
    const state = makeState();
    const recs = [makeRec()];
    const messages = buildExplainPrompt(state, recs);

    expectUserContent(messages, 'Buy shop minion at index 0');
    expectUserContent(messages, 'cardId: Minion_123');
    expectUserContent(messages, 'Turn 5');
    expectUserContent(messages, 'Tier 5');
    expectUserContent(messages, 'HP 30');
    expectUserContent(messages, 'Gold 8');
    expectUserContent(messages, 'Opponent 2');
  });

  it('handles no recommendations', () => {
    const state = makeState();
    const messages = buildExplainPrompt(state, []);

    expect(messages).toHaveLength(2);
    const [sys, usr] = messages as unknown as readonly [(typeof messages)[0], (typeof messages)[1]];
    expect(sys.role).toBe('system');
    expect(usr.role).toBe('user');
    expect(usr.content).toBe('No recommendations available.');
  });

  it('handles Sell action', () => {
    const state = makeState();
    const recs = [
      makeRec({
        action: { type: 'Sell', boardIndex: 2 },
      }),
    ];
    const messages = buildExplainPrompt(state, recs);
    expectUserContent(messages, 'Sell board minion at index 2');
  });

  it('handles Freeze action', () => {
    const state = makeState();
    const recs = [
      makeRec({
        action: { type: 'Freeze' },
      }),
    ];
    const messages = buildExplainPrompt(state, recs);
    expectUserContent(messages, 'Freeze the shop');
  });

  it('handles Reroll action', () => {
    const state = makeState();
    const recs = [
      makeRec({
        action: { type: 'Reroll' },
      }),
    ];
    const messages = buildExplainPrompt(state, recs);
    expectUserContent(messages, 'Reroll the shop');
  });

  it('handles TierUp action with cost', () => {
    const state = makeState();
    const recs = [
      makeRec({
        action: { type: 'TierUp' },
      }),
    ];
    const messages = buildExplainPrompt(state, recs);
    expectUserContent(messages, 'Tier up (cost: 4 gold)');
  });

  it('handles Reposition action', () => {
    const state = makeState();
    const recs = [
      makeRec({
        action: { type: 'Reposition', fromIndex: 1, toIndex: 3 },
      }),
    ];
    const messages = buildExplainPrompt(state, recs);
    expectUserContent(messages, 'Reposition minion from index 1 to 3');
  });

  it('excludes eliminated opponents from user message', () => {
    const state = makeState({
      opponents: [
        {
          entityId: 2,
          playerId: 2,
          hero: { entityId: 2, cardId: 'Hero_02', hp: 25, armor: 0 },
          board: { minions: [] },
          tier: 4,
          eliminated: false,
        },
        {
          entityId: 3,
          playerId: 3,
          hero: { entityId: 3, cardId: 'Hero_03', hp: 0, armor: 0 },
          board: { minions: [] },
          tier: 3,
          eliminated: true,
        },
      ],
    });
    const recs = [makeRec()];
    const messages = buildExplainPrompt(state, recs);
    const usr = (messages as unknown as [(typeof messages)[0], (typeof messages)[1]])[1];
    expect(usr.content).toContain('Opponent 2');
    expect(usr.content).not.toContain('Opponent 3');
  });

  it('shows "No active opponents." when all eliminated', () => {
    const state = makeState({
      opponents: [
        {
          entityId: 2,
          playerId: 2,
          hero: { entityId: 2, cardId: 'Hero_02', hp: 25, armor: 0 },
          board: { minions: [] },
          tier: 4,
          eliminated: true,
        },
      ],
    });
    const recs = [makeRec()];
    const messages = buildExplainPrompt(state, recs);
    const usr = (messages as unknown as [(typeof messages)[0], (typeof messages)[1]])[1];
    expect(usr.content).toContain('No active opponents.');
  });

  it('includes score and confidence in output', () => {
    const state = makeState();
    const recs = [
      makeRec({
        score: 0.92,
        confidence: 0.88,
      }),
    ];
    const messages = buildExplainPrompt(state, recs);
    const usr = (messages as unknown as [(typeof messages)[0], (typeof messages)[1]])[1];
    expect(usr.content).toContain('score: 0.92');
    expect(usr.content).toContain('confidence: 0.88');
  });

  it('includes reason when present', () => {
    const state = makeState();
    const recs = [
      makeRec({
        reason: 'Triple opportunity on Murloc',
      }),
    ];
    const messages = buildExplainPrompt(state, recs);
    const usr = (messages as unknown as [(typeof messages)[0], (typeof messages)[1]])[1];
    expect(usr.content).toContain('Reason: Triple opportunity on Murloc');
  });

  it('omits reason when empty string', () => {
    const state = makeState();
    const recs = [
      makeRec({
        reason: '',
      }),
    ];
    const messages = buildExplainPrompt(state, recs);
    const usr = (messages as unknown as [(typeof messages)[0], (typeof messages)[1]])[1];
    expect(usr.content).not.toContain('Reason:');
  });

  it('Buy recommendation contains cardId, action type, and score digit', () => {
    const state = makeState();
    const recs = [
      makeRec({
        action: { type: 'Buy', cardId: 'Minion_456', shopIndex: 1 },
        score: 0.75,
      }),
    ];
    const messages = buildExplainPrompt(state, recs);
    const usr = (messages as unknown as [(typeof messages)[0], (typeof messages)[1]])[1];
    expect(usr.content).toContain('Minion_456');
    expect(usr.content).toContain('Buy');
    expect(usr.content).toMatch(/0\.\d+/);
  });
});
