import { recommend } from '@overlay/advisor';
import { explain } from '@overlay/llm';
import type { HsEvent } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';
import { appendSessionEvent } from '@overlay/shared';
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

  // Wire onEvent to call recommend + setAdvice on each event
  const originalOnEvent = pipeline.onEvent;
  pipeline.onEvent = (event: HsEvent) => {
    originalOnEvent(event);
    try {
      const recs = recommend(pipeline.getState());
      const top = recs[0];
      if (top) {
        setAdvice(top);
        if (top.needsExplanation === true) {
          explain(top, pipeline.getState())
            .then((text) => setExplanation(text))
            .catch(() => {});
        }
      }
      (opts?.logFn ?? appendSessionEvent)('recommendation', {
        turn: pipeline.getState().turn,
        action: recs[0]?.action ?? null,
      });
    } catch {
      // If recommend throws, clear advice rather than crashing
      setAdvice(null);
    }
  };

  // Start the IPC bridge so the renderer gets state/recs updates
  startBridge(win, pipeline.getState, () => {
    try {
      const recs = recommend(pipeline.getState());
      return recs.length > 0 ? recs : null;
    } catch {
      return null;
    }
  });

  const coordinator: Coordinator = {
    onEvent: pipeline.onEvent,
    getState: pipeline.getState,
    stop(): void {
      stopBridge();
    },
  };
  return coordinator;
}
