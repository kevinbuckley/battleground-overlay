import type { ScoreResult } from '@overlay/advisor';
import { getCardById } from '@overlay/card-data';
import type { GameState, Minion, Recommendation } from '@overlay/shared';
import type { BrowserWindow } from 'electron';
import { computeDamageForecast } from './damageWidget';

type CardLookup = (cardId: string) => { name?: string } | null | undefined;
type HsStatus = 'waiting' | 'anchored' | 'failed';

interface BridgeState {
  win: BrowserWindow;
  getState: () => GameState;
  getRecs: () => Recommendation[] | null;
  getScoreResult: () => ScoreResult | null;
  getHsStatus?: () => HsStatus;
  lastPayloads: Map<string, string>;
}

let activeBridge: BridgeState | null = null;

export function enrichRecommendationCardName(
  rec: Recommendation,
  lookup: CardLookup = getCardById,
): Recommendation {
  if (rec.action.type !== 'Buy' && rec.action.type !== 'Sell') return rec;
  if (!rec.action.cardId) return rec;
  const cardName = lookup(rec.action.cardId)?.name ?? rec.action.cardId;
  return {
    ...rec,
    action: {
      ...rec.action,
      cardName,
    },
  };
}

export function toBoardUpdateMinion(
  minion: Minion,
  lookup: CardLookup = getCardById,
): {
  cardId: string;
  name: string;
  attack: number;
  health: number;
  taunt: boolean;
  divineShield: boolean;
} {
  return {
    cardId: minion.cardId,
    name: lookup(minion.cardId)?.name ?? minion.cardId,
    attack: minion.attack,
    health: minion.health,
    taunt: minion.taunt,
    divineShield: minion.divineShield,
  };
}

export function toShopUpdateMinion(
  minion: Minion,
  lookup: CardLookup = getCardById,
): {
  cardId: string;
  name: string;
  attack: number;
  health: number;
} {
  return {
    cardId: minion.cardId,
    name: lookup(minion.cardId)?.name ?? minion.cardId,
    attack: minion.attack,
    health: minion.health,
  };
}

export function startBridge(
  win: BrowserWindow,
  getState: () => GameState,
  getRecs: () => Recommendation[] | null,
  getScoreResult: () => ScoreResult | null,
  getHsStatus?: () => HsStatus,
): void {
  activeBridge = {
    win,
    getState,
    getRecs,
    getScoreResult,
    getHsStatus,
    lastPayloads: new Map(),
  };
  pushBridgeUpdate();
}

function sendIfChanged(bridge: BridgeState, channel: string, payload: unknown): void {
  const serialized = JSON.stringify(payload);
  if (bridge.lastPayloads.get(channel) === serialized) return;
  try {
    bridge.win.webContents.send(channel, payload);
    bridge.lastPayloads.set(channel, serialized);
  } catch {
    // Renderer may not be ready yet.
  }
}

export function pushBridgeUpdate(): void {
  const bridge = activeBridge;
  if (!bridge) return;

  let state: GameState | null = null;
  try {
    state = bridge.getState();
    sendIfChanged(bridge, 'overlay:state-update', state);
    sendIfChanged(bridge, 'overlay:board-update', {
      minions: state.player.board.minions.map((m) => toBoardUpdateMinion(m)),
    });
    sendIfChanged(
      bridge,
      'overlay:shop-update',
      state.player.shop.minions.map((m) => toShopUpdateMinion(m)),
    );
    sendIfChanged(
      bridge,
      'overlay:opponents-update',
      state.opponents.map((o) => ({
        entityId: o.entityId,
        hp: o.hero.hp,
        tier: o.tier,
        eliminated: o.eliminated,
      })),
    );
  } catch {
    // Renderer or state provider may not be ready yet.
  }

  try {
    const recs = bridge.getRecs();
    sendIfChanged(
      bridge,
      'overlay:recs-update',
      (recs ?? []).slice(0, 3).map((rec) => enrichRecommendationCardName(rec)),
    );
  } catch {
    // Renderer may not be ready yet.
  }

  try {
    const scoreResult = bridge.getScoreResult();
    if (scoreResult) {
      state ??= bridge.getState();
      sendIfChanged(
        bridge,
        'overlay:damage-update',
        computeDamageForecast(scoreResult, state.player.tier),
      );
    }
  } catch {
    // Renderer may not be ready yet.
  }

  try {
    if (bridge.getHsStatus) {
      sendIfChanged(bridge, 'overlay:hs-status', bridge.getHsStatus());
    }
  } catch {
    // Renderer may not be ready yet.
  }
}

export function stopBridge(): void {
  activeBridge = null;
}
