import type { ScoreResult } from '@overlay/advisor';
import type { GameState, Recommendation } from '@overlay/shared';
import type { BrowserWindow } from 'electron';
import { computeDamageForecast } from './damageWidget';

let pollInterval: ReturnType<typeof setInterval> | null = null;

export function startBridge(
  win: BrowserWindow,
  getState: () => GameState,
  getRecs: () => Recommendation[] | null,
  getScoreResult: () => ScoreResult | null,
): void {
  pollInterval = setInterval(() => {
    try {
      const state = getState();
      win.webContents.send('overlay:state-update', state);
      try {
        win.webContents.send('overlay:board-update', {
          minions: state.player.board.minions.map((m) => ({
            cardId: m.cardId,
            attack: m.attack,
            health: m.health,
            taunt: m.taunt,
            divineShield: m.divineShield,
          })),
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
        win.webContents.send('overlay:recs-update', recs);
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
  }, 500);
}

export function stopBridge(): void {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}
