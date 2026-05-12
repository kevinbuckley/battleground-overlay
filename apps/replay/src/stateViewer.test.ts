import type { GameState } from '@overlay/shared';
import { initialState } from '@overlay/state';
import { formatState } from './stateViewer';

function makeState(overrides: Partial<GameState> = {}): GameState {
  const base = initialState();
  return { ...base, ...overrides, player: { ...base.player, ...overrides.player } };
}

describe('formatState', () => {
  it('initialState output contains "turn: 0"', () => {
    const output = formatState(initialState());
    expect(output).toContain('turn: 0');
  });

  it('includes phase', () => {
    const output = formatState(makeState({ phase: 'combat' }));
    expect(output).toContain('phase: combat');
  });

  it('includes player hp/tier/gold', () => {
    const output = formatState(
      makeState({
        player: {
          hero: { entityId: 1, cardId: 'HERO_1', hp: 25, armor: 3 },
          gold: 5,
          tier: 4,
          board: { minions: [] },
          shop: { minions: [], frozen: false, rollCost: 2 },
          entityId: 1,
          playerId: 0,
          tierUpCost: 6,
          eliminated: false,
          entityRegistry: new Map(),
        },
      }),
    );
    expect(output).toContain('player hp: 25');
    expect(output).toContain('player tier: 4');
    expect(output).toContain('player gold: 5');
  });

  it('includes board minion count', () => {
    const output = formatState(
      makeState({
        player: {
          ...initialState().player,
          board: {
            minions: [
              {
                entityId: 1,
                cardId: 'MINION_1',
                attack: 3,
                health: 4,
                taunt: false,
                divineShield: false,
                poisonous: false,
                reborn: false,
                frozen: false,
                tribes: [],
              },
            ],
          },
        },
      }),
    );
    expect(output).toContain('board minions: 1');
  });

  it('includes opponent count and details', () => {
    const output = formatState(
      makeState({
        opponents: [
          {
            entityId: 2,
            playerId: 1,
            hero: { entityId: 2, cardId: 'HERO_2', hp: 30, armor: 0 },
            board: { minions: [] },
            tier: 3,
            eliminated: false,
          },
          {
            entityId: 3,
            playerId: 2,
            hero: { entityId: 3, cardId: 'HERO_3', hp: 10, armor: 0 },
            board: { minions: [] },
            tier: 5,
            eliminated: true,
          },
        ],
      }),
    );
    expect(output).toContain('opponents: 2');
    expect(output).toContain('opp[1] hp:30 tier:3 elim:false board:0');
    expect(output).toContain('opp[2] hp:10 tier:5 elim:true board:0');
  });
});
