import { afterEach, describe, expect, it } from 'bun:test';
import type { GameState, Recommendation } from '@overlay/shared';
import {
  enrichRecommendationCardName,
  startBridge,
  stopBridge,
  toBoardUpdateMinion,
} from './ipcBridge';

function makeMockWin() {
  const sends: { channel: string; args: unknown[] }[] = [];
  return {
    webContents: {
      send: (channel: string, ...args: unknown[]) => {
        sends.push({ channel, args });
      },
    },
    _getSends: () => sends,
  };
}

function makeMockState(): GameState {
  return {
    turn: 3,
    phase: 'shopping',
    lobbySize: 8,
    anomaly: null,
    player: {
      entityId: 1,
      playerId: 1,
      hero: { entityId: 1, cardId: 'HERO_1', hp: 30, armor: 0 },
      board: { minions: [] },
      shop: { minions: [], frozen: false, rollCost: 1 },
      hand: [],
      gold: 3,
      tier: 3,
      tierUpCost: 4,
      eliminated: false,
      pendingTriple: null,
      heroPowerUsedThisTurn: false,
      handSize: 0,
      entityRegistry: new Map(),
    },
    opponents: [],
  };
}

describe('ipcBridge', () => {
  afterEach(() => {
    stopBridge();
  });

  it('startBridge pushes overlay:state-update on the 500ms interval', async () => {
    const mockWin = makeMockWin();
    const state = makeMockState();
    startBridge(
      mockWin as unknown as import('electron').BrowserWindow,
      () => state,
      () => null,
      () => null,
    );

    await new Promise<void>((resolve) => setTimeout(resolve, 600));
    const sends = (
      mockWin as { _getSends: () => { channel: string; args: unknown[] }[] }
    )._getSends();
    const stateChannels = sends.filter((s) => s.channel === 'overlay:state-update');
    expect(stateChannels.length).toBeGreaterThanOrEqual(1);
    expect(stateChannels[0].args[0]).toEqual(state);
  });

  it('startBridge pushes overlay:recs-update when getRecs returns recs', async () => {
    const mockWin = makeMockWin();
    const state = makeMockState();
    const recs: Recommendation[] = [
      {
        action: { type: 'Buy' as const, cardId: 'test_123', shopIndex: 0 },
        score: 0.85,
        confidence: 0.9,
        reason: 'triple opportunity',
      },
    ];
    startBridge(
      mockWin as unknown as import('electron').BrowserWindow,
      () => state,
      () => recs,
      () => null,
    );

    await new Promise<void>((resolve) => setTimeout(resolve, 600));
    const sends = (
      mockWin as { _getSends: () => { channel: string; args: unknown[] }[] }
    )._getSends();
    const recsChannels = sends.filter((s) => s.channel === 'overlay:recs-update');
    expect(recsChannels.length).toBeGreaterThanOrEqual(1);
    expect(recsChannels[0].args[0]).toEqual([
      {
        ...recs[0],
        action: { type: 'Buy', cardId: 'test_123', shopIndex: 0, cardName: 'test_123' },
      },
    ]);
  });

  it('startBridge does not push overlay:recs-update when getRecs returns null', async () => {
    const mockWin = makeMockWin();
    const state = makeMockState();
    startBridge(
      mockWin as unknown as import('electron').BrowserWindow,
      () => state,
      () => null,
      () => null,
    );

    await new Promise<void>((resolve) => setTimeout(resolve, 600));
    const sends = (
      mockWin as { _getSends: () => { channel: string; args: unknown[] }[] }
    )._getSends();
    const recsChannels = sends.filter((s) => s.channel === 'overlay:recs-update');
    expect(recsChannels.length).toBe(0);
  });

  it('startBridge pushes overlay:board-update with board minion shape', async () => {
    const mockWin = makeMockWin();
    const state = makeMockState();
    state.player.board.minions = [
      {
        entityId: 10,
        cardId: 'CS1_129',
        attack: 3,
        health: 2,
        taunt: true,
        divineShield: false,
        poisonous: false,
        reborn: false,
        frozen: false,
        golden: false,
        windfury: false,
        cleave: false,
        tribes: ['Murloc'],
      },
      {
        entityId: 11,
        cardId: 'NEW1_030',
        attack: 6,
        health: 5,
        taunt: false,
        divineShield: true,
        poisonous: false,
        reborn: false,
        frozen: false,
        golden: true,
        windfury: false,
        cleave: false,
        tribes: ['Dragon'],
      },
    ];
    startBridge(
      mockWin as unknown as import('electron').BrowserWindow,
      () => state,
      () => null,
      () => null,
    );

    await new Promise<void>((resolve) => setTimeout(resolve, 600));
    const sends = (
      mockWin as { _getSends: () => { channel: string; args: unknown[] }[] }
    )._getSends();
    const boardChannels = sends.filter((s) => s.channel === 'overlay:board-update');
    expect(boardChannels.length).toBeGreaterThanOrEqual(1);
    const boardPayload = boardChannels[0].args[0] as {
      minions: {
        cardId: string;
        attack: number;
        health: number;
        taunt: boolean;
        divineShield: boolean;
      }[];
    };
    expect(boardPayload.minions).toHaveLength(2);
    expect(boardPayload.minions[0].cardId).toBe('CS1_129');
    expect(boardPayload.minions[0].name).toBe('CS1_129');
    expect(boardPayload.minions[0].attack).toBe(3);
    expect(boardPayload.minions[0].health).toBe(2);
    expect(boardPayload.minions[0].taunt).toBe(true);
    expect(boardPayload.minions[0].divineShield).toBe(false);
    expect(boardPayload.minions[1].cardId).toBe('NEW1_030');
    expect(boardPayload.minions[1].name).toBe('NEW1_030');
    expect(boardPayload.minions[1].divineShield).toBe(true);
  });

  it('enrichRecommendationCardName uses the looked-up card name for Buy actions', () => {
    const rec: Recommendation = {
      action: { type: 'Buy', cardId: 'TB_001', shopIndex: 0 },
      score: 0.9,
      confidence: 0.9,
      reason: '',
    };

    const enriched = enrichRecommendationCardName(rec, () => ({ name: 'Alleycat' }));

    expect(enriched.action).toEqual({
      type: 'Buy',
      cardId: 'TB_001',
      shopIndex: 0,
      cardName: 'Alleycat',
    });
  });

  it('enrichRecommendationCardName falls back to cardId when no card is found', () => {
    const rec: Recommendation = {
      action: { type: 'Buy', cardId: 'TB_001', shopIndex: 0 },
      score: 0.9,
      confidence: 0.9,
      reason: '',
    };

    const enriched = enrichRecommendationCardName(rec, () => undefined);

    expect(enriched.action).toEqual({
      type: 'Buy',
      cardId: 'TB_001',
      shopIndex: 0,
      cardName: 'TB_001',
    });
  });

  it('toBoardUpdateMinion adds a looked-up card name', () => {
    const state = makeMockState();
    state.player.board.minions = [
      {
        entityId: 1,
        cardId: 'TB_001',
        attack: 1,
        health: 1,
        taunt: false,
        divineShield: false,
        poisonous: false,
        reborn: false,
        frozen: false,
        golden: false,
        windfury: false,
        cleave: false,
        elite: false,
        lifesteal: false,
        cost: 0,
        tribes: [],
        spellPower: 0,
        exhausted: false,
        magnetic: false,
        immune: false,
        charge: false,
      },
    ];

    expect(toBoardUpdateMinion(state.player.board.minions[0], () => ({ name: 'Alleycat' })).name).toBe(
      'Alleycat',
    );
  });

  it('startBridge pushes overlay:opponents-update with opponent shape', async () => {
    const mockWin = makeMockWin();
    const state = makeMockState();
    state.opponents = [
      {
        entityId: 2,
        playerId: 2,
        hero: { entityId: 2, cardId: 'HERO_2', hp: 30, armor: 0 },
        board: { minions: [] },
        tier: 3,
        eliminated: false,
      },
      {
        entityId: 3,
        playerId: 3,
        hero: { entityId: 3, cardId: 'HERO_3', hp: 15, armor: 5 },
        board: { minions: [] },
        tier: 5,
        eliminated: true,
      },
    ];
    startBridge(
      mockWin as unknown as import('electron').BrowserWindow,
      () => state,
      () => null,
      () => null,
    );

    await new Promise<void>((resolve) => setTimeout(resolve, 600));
    const sends = (
      mockWin as { _getSends: () => { channel: string; args: unknown[] }[] }
    )._getSends();
    const oppChannels = sends.filter((s) => s.channel === 'overlay:opponents-update');
    expect(oppChannels.length).toBeGreaterThanOrEqual(1);
    const oppPayload = oppChannels[0].args[0] as {
      entityId: number;
      hp: number;
      tier: number;
      eliminated: boolean;
    }[];
    expect(oppPayload).toHaveLength(2);
    expect(oppPayload[0].entityId).toBe(2);
    expect(oppPayload[0].hp).toBe(30);
    expect(oppPayload[0].tier).toBe(3);
    expect(oppPayload[0].eliminated).toBe(false);
    expect(oppPayload[1].entityId).toBe(3);
    expect(oppPayload[1].hp).toBe(15);
    expect(oppPayload[1].tier).toBe(5);
    expect(oppPayload[1].eliminated).toBe(true);
  });

  it('stopBridge clears the interval', async () => {
    const mockWin = makeMockWin();
    const state = makeMockState();
    startBridge(
      mockWin as unknown as import('electron').BrowserWindow,
      () => state,
      () => null,
      () => null,
    );
    stopBridge();

    const sendsBefore = (
      mockWin as { _getSends: () => { channel: string; args: unknown[] }[] }
    )._getSends().length;
    await new Promise<void>((resolve) => setTimeout(resolve, 600));
    const sendsAfter = (
      mockWin as { _getSends: () => { channel: string; args: unknown[] }[] }
    )._getSends().length;
    expect(sendsAfter).toBe(sendsBefore);
  });

  it('startBridge pushes overlay:damage-update with damage forecast', async () => {
    const mockWin = makeMockWin();
    const state = makeMockState();
    const scoreResult = { winPct: 0.75, avgHpDelta: 3 };
    startBridge(
      mockWin as unknown as import('electron').BrowserWindow,
      () => state,
      () => null,
      () => scoreResult,
    );

    await new Promise<void>((resolve) => setTimeout(resolve, 600));
    const sends = (
      mockWin as { _getSends: () => { channel: string; args: unknown[] }[] }
    )._getSends();
    const damageChannels = sends.filter((s) => s.channel === 'overlay:damage-update');
    expect(damageChannels.length).toBeGreaterThanOrEqual(1);
    const forecast = damageChannels[0].args[0] as {
      minDmg: number;
      maxDmg: number;
      winPct: number;
    };
    expect(forecast.winPct).toBe(0.75);
    expect(forecast.minDmg).toBe(1);
    expect(forecast.maxDmg).toBe(2);
  });

  it('startBridge sends overlay:hs-status when getHsStatus is provided', async () => {
    const mockWin = makeMockWin();
    const state = makeMockState();
    startBridge(
      mockWin as unknown as import('electron').BrowserWindow,
      () => state,
      () => null,
      () => null,
      () => 'anchored',
    );

    await new Promise<void>((resolve) => setTimeout(resolve, 600));
    const sends = (
      mockWin as { _getSends: () => { channel: string; args: unknown[] }[] }
    )._getSends();
    const hsChannels = sends.filter((s) => s.channel === 'overlay:hs-status');
    expect(hsChannels.length).toBeGreaterThanOrEqual(1);
    expect(hsChannels[0].args[0]).toBe('anchored');
  });

  it('startBridge does not send overlay:hs-status when getHsStatus is omitted', async () => {
    const mockWin = makeMockWin();
    const state = makeMockState();
    startBridge(
      mockWin as unknown as import('electron').BrowserWindow,
      () => state,
      () => null,
      () => null,
    );

    await new Promise<void>((resolve) => setTimeout(resolve, 600));
    const sends = (
      mockWin as { _getSends: () => { channel: string; args: unknown[] }[] }
    )._getSends();
    const hsChannels = sends.filter((s) => s.channel === 'overlay:hs-status');
    expect(hsChannels.length).toBe(0);
  });

  it('startBridge sends only top-3 recs when more than 3 are returned', async () => {
    const mockWin = makeMockWin();
    const state = makeMockState();
    const recs: Recommendation[] = [
      {
        action: { type: 'Buy' as const, cardId: 'a', shopIndex: 0 },
        score: 0.9,
        confidence: 0.9,
        reason: '',
      },
      {
        action: { type: 'Buy' as const, cardId: 'b', shopIndex: 1 },
        score: 0.8,
        confidence: 0.8,
        reason: '',
      },
      {
        action: { type: 'Buy' as const, cardId: 'c', shopIndex: 2 },
        score: 0.7,
        confidence: 0.7,
        reason: '',
      },
      {
        action: { type: 'Buy' as const, cardId: 'd', shopIndex: 3 },
        score: 0.6,
        confidence: 0.6,
        reason: '',
      },
      {
        action: { type: 'Buy' as const, cardId: 'e', shopIndex: 4 },
        score: 0.5,
        confidence: 0.5,
        reason: '',
      },
    ];
    startBridge(
      mockWin as unknown as import('electron').BrowserWindow,
      () => state,
      () => recs,
      () => null,
    );

    await new Promise<void>((resolve) => setTimeout(resolve, 600));
    const sends = (
      mockWin as { _getSends: () => { channel: string; args: unknown[] }[] }
    )._getSends();
    const recsChannels = sends.filter((s) => s.channel === 'overlay:recs-update');
    expect(recsChannels.length).toBeGreaterThanOrEqual(1);
    const sentRecs = recsChannels[0].args[0] as Recommendation[];
    expect(sentRecs).toHaveLength(3);
  });

  it('startBridge sends 1 rec when only 1 is returned', async () => {
    const mockWin = makeMockWin();
    const state = makeMockState();
    const recs: Recommendation[] = [
      {
        action: { type: 'Buy' as const, cardId: 'a', shopIndex: 0 },
        score: 0.9,
        confidence: 0.9,
        reason: '',
      },
    ];
    startBridge(
      mockWin as unknown as import('electron').BrowserWindow,
      () => state,
      () => recs,
      () => null,
    );

    await new Promise<void>((resolve) => setTimeout(resolve, 600));
    const sends = (
      mockWin as { _getSends: () => { channel: string; args: unknown[] }[] }
    )._getSends();
    const recsChannels = sends.filter((s) => s.channel === 'overlay:recs-update');
    expect(recsChannels.length).toBeGreaterThanOrEqual(1);
    const sentRecs = recsChannels[0].args[0] as Recommendation[];
    expect(sentRecs).toHaveLength(1);
  });
});
