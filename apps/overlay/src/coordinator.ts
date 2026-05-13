import { recommend } from '@overlay/advisor';
import { explain } from '@overlay/llm';
import type { HsEvent } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';
import { appendSessionEvent, setBoardPanel } from '@overlay/shared';
import { type Pipeline, createPipeline } from '@overlay/state';
import type { BrowserWindow } from 'electron';
import { setAdvice } from './advicePanel';
import { setExplanation } from './explanationPanel';
import { startBridge, stopBridge } from './ipcBridge';

export interface Coordinator {
  onEvent: (event: HsEvent) => void;
  getState: () => GameState;
  stop: () => void;
}

export interface CoordinatorOpts {
  logFn?: (kind: string, payload: unknown) => void;
}

export function startCoordinator(win: BrowserWindow, opts?: CoordinatorOpts): Coordinator {
  const pipeline: Pipeline = createPipeline();
  let previousTurn: number | null = null;

  // Wire onEvent to call recommend + setAdvice on each event
  const originalOnEvent = pipeline.onEvent;
  pipeline.onEvent = (event: HsEvent) => {
    (opts?.logFn ?? appendSessionEvent)('event', { kind: event.kind });
    originalOnEvent(event);
    const state = pipeline.getState();
    const currentTurn = state.turn;

    // Log a state-snapshot when the turn increments
    if (previousTurn !== null && currentTurn > previousTurn) {
      (opts?.logFn ?? appendSessionEvent)('state-snapshot', {
        turn: currentTurn,
        phase: state.phase,
        gold: state.player.gold,
        tier: state.player.tier,
      });
    }
    previousTurn = currentTurn;

    try {
      const recs = recommend(state);
      const top = recs[0];
      if (top) {
        setAdvice(top);
        if (top.action.type === 'Reposition') {
          setBoardPanel({ recommendation: top });
        }
        if (top.needsExplanation === true) {
          explain(top, state)
            .then((text) => setExplanation(text))
            .catch(() => {});
        }
      }
      (opts?.logFn ?? appendSessionEvent)('recommendation', {
        turn: currentTurn,
        action: recs[0]?.action ?? null,
      });
    } catch {
      // If recommend throws, clear advice rather than crashing
      setAdvice(null);
    }
  };

  // Start the IPC bridge so the renderer gets state/recs updates
  startBridge(
    win,
    pipeline.getState,
    () => {
      try {
        const recs = recommend(pipeline.getState());
        return recs.length > 0 ? recs : null;
      } catch {
        return null;
      }
    },
    () => null,
  );

  const coordinator: Coordinator = {
    onEvent: pipeline.onEvent,
    getState: pipeline.getState,
    stop(): void {
      stopBridge();
    },
  };
  return coordinator;
}
