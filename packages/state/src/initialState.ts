import type { GameState } from '@overlay/shared';

export function initialState(): GameState {
  return {
    turn: 0,
    phase: 'lobby',
    player: {
      entityId: 0,
      playerId: 0,
      hero: { entityId: 0, cardId: '', hp: 40, armor: 0 },
      board: { minions: [] },
      shop: { minions: [], frozen: false, rollCost: 1 },
      gold: 0,
      tier: 1,
      tierUpCost: 6,
      eliminated: false,
      entityRegistry: new Map(),
    },
    opponents: [],
  };
}
