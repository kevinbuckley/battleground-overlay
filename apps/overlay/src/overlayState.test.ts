import { describe, expect, it } from 'bun:test';
import type { GameState } from '@overlay/shared';
import { getOverlayWin, setInteractive } from './overlayState';
import { getGold, getTier } from './overlayState';

describe('overlayState', () => {
  it('getOverlayWin returns null when no window is set', () => {
    expect(getOverlayWin()).toBeNull();
  });

  it('setInteractive does not throw when no window is set', () => {
    expect(() => setInteractive(true)).not.toThrow();
    expect(() => setInteractive(false)).not.toThrow();
  });

  describe('getGold', () => {
    it('returns correct gold value', () => {
      const state = {
        turn: 5,
        phase: 'shopping' as const,
        player: {
          entityId: 0,
          playerId: 1,
          hp: 30,
          gold: 8,
          tier: 5,
          tierUpCost: 5,
          shop: { minions: [], frozen: false, rollCost: 1 },
          board: { minions: [] },
          hand: [],
          handSize: 0,
          heroPowerUsedThisTurn: false,
          pendingTriple: null,
          entityRegistry: new Map(),
          hero: { entityId: 0, cardId: 'Hero_Murloc', hp: 30, armor: 0 },
          eliminated: false,
        },
        opponents: [],
        lobbySize: 8,
        anomaly: null,
      } as GameState;
      expect(getGold(state)).toBe(8);
    });

    it('returns 0 for empty player', () => {
      const state = {
        turn: 1,
        phase: 'shopping' as const,
        player: null as unknown as GameState['player'],
        opponents: [],
        lobbySize: 8,
        anomaly: null,
      } as GameState;
      expect(getGold(state)).toBe(0);
    });
  });

  describe('getTier', () => {
    it('returns correct tier value', () => {
      const state = {
        turn: 5,
        phase: 'shopping' as const,
        player: {
          entityId: 0,
          playerId: 1,
          hp: 30,
          gold: 8,
          tier: 5,
          tierUpCost: 5,
          shop: { minions: [], frozen: false, rollCost: 1 },
          board: { minions: [] },
          hand: [],
          handSize: 0,
          heroPowerUsedThisTurn: false,
          pendingTriple: null,
          entityRegistry: new Map(),
          hero: { entityId: 0, cardId: 'Hero_Murloc', hp: 30, armor: 0 },
          eliminated: false,
        },
        opponents: [],
        lobbySize: 8,
        anomaly: null,
      } as GameState;
      expect(getTier(state)).toBe(5);
    });

    it('returns 0 for empty player', () => {
      const state = {
        turn: 1,
        phase: 'shopping' as const,
        player: null as unknown as GameState['player'],
        opponents: [],
        lobbySize: 8,
        anomaly: null,
      } as GameState;
      expect(getTier(state)).toBe(0);
    });
  });
});
