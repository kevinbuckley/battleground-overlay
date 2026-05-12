import { afterEach, describe, expect, it } from 'bun:test';
import type { GameState, Recommendation } from '@overlay/shared';
import { startBridge, stopBridge } from './ipcBridge';

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
    );

    await new Promise<void>((resolve) => setTimeout(resolve, 600));
    const sends = (
      mockWin as { _getSends: () => { channel: string; args: unknown[] }[] }
    )._getSends();
    const recsChannels = sends.filter((s) => s.channel === 'overlay:recs-update');
    expect(recsChannels.length).toBeGreaterThanOrEqual(1);
    expect(recsChannels[0].args[0]).toEqual(recs);
  });

  it('startBridge does not push overlay:recs-update when getRecs returns null', async () => {
    const mockWin = makeMockWin();
    const state = makeMockState();
    startBridge(
      mockWin as unknown as import('electron').BrowserWindow,
      () => state,
      () => null,
    );

    await new Promise<void>((resolve) => setTimeout(resolve, 600));
    const sends = (
      mockWin as { _getSends: () => { channel: string; args: unknown[] }[] }
    )._getSends();
    const recsChannels = sends.filter((s) => s.channel === 'overlay:recs-update');
    expect(recsChannels.length).toBe(0);
  });

  it('stopBridge clears the interval', async () => {
    const mockWin = makeMockWin();
    const state = makeMockState();
    startBridge(
      mockWin as unknown as import('electron').BrowserWindow,
      () => state,
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
});
