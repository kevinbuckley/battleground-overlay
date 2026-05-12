import type { GameState } from '@overlay/shared';

export function initialState(): GameState {
  return {
    turn: 0,
    phase: 'lobby',
    lobbySize: 8,
    anomaly: null,
    player: {
      entityId: 0,
      playerId: 0,
      hero: { entityId: 0, cardId: '', hp: 40, armor: 0 },
      board: { minions: [] },
      shop: { minions: [], frozen: false, rollCost: 1 },
      hand: [],
      gold: 0,
      tier: 1,
      tierUpCost: 6,
      eliminated: false,
      pendingTriple: null,
      heroPowerUsedThisTurn: false,
      handSize: 0,
      entityRegistry: new Map(),
    },
    opponents: [],
  };
}
