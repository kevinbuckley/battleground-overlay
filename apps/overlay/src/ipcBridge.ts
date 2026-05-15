import type { ScoreResult } from '@overlay/advisor';
import { getCardById } from '@overlay/card-data';
import type { GameState, Minion, Recommendation } from '@overlay/shared';
import type { BrowserWindow } from 'electron';
import { computeDamageForecast } from './damageWidget';

let pollInterval: ReturnType<typeof setInterval> | null = null;

type CardLookup = (cardId: string) => { name?: string } | null | undefined;

export function enrichRecommendationCardName(
  rec: Recommendation,
  lookup: CardLookup = getCardById,
): Recommendation {
  if (rec.action.type !== 'Buy') return rec;
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

export function startBridge(
  win: BrowserWindow,
  getState: () => GameState,
  getRecs: () => Recommendation[] | null,
  getScoreResult: () => ScoreResult | null,
  getHsStatus?: () => string,
): void {
  pollInterval = setInterval(() => {
    try {
      const state = getState();
      win.webContents.send('overlay:state-update', state);
      try {
        win.webContents.send('overlay:board-update', {
          minions: state.player.board.minions.map((m) => toBoardUpdateMinion(m)),
        });
      } catch {
        // swallow
      }
      try {
        win.webContents.send(
          'overlay:opponents-update',
          state.opponents.map((o) => ({
            entityId: o.entityId,
            hp: o.hero.hp,
            tier: o.tier,
            eliminated: o.eliminated,
          })),
        );
      } catch {
        // swallow
      }
    } catch {
      // swallow — renderer may not be ready yet
    }
    try {
      const recs = getRecs?.();
      if (recs) {
        win.webContents.send(
          'overlay:recs-update',
          recs.slice(0, 3).map((rec) => enrichRecommendationCardName(rec)),
        );
      }
    } catch {
      // swallow — renderer may not be ready yet
    }
    try {
      const scoreResult = getScoreResult?.();
      if (scoreResult) {
        const state = getState();
        const forecast = computeDamageForecast(scoreResult, state.player.tier);
        win.webContents.send('overlay:damage-update', forecast);
      }
    } catch {
      // swallow — renderer may not be ready yet
    }
    try {
      if (getHsStatus) {
        win.webContents.send('overlay:hs-status', getHsStatus());
      }
    } catch {
      // swallow — renderer may not be ready yet
    }
  }, 500);
}

export function stopBridge(): void {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}
