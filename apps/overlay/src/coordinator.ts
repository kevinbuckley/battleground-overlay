import { recommend } from '@overlay/advisor';
import { explain } from '@overlay/llm';
import type { HsEvent } from '@overlay/log-parser';
import type { GameState, Recommendation } from '@overlay/shared';
import { appendSessionEvent, clearBoardPanel, setBoardPanel } from '@overlay/shared';
import { type Pipeline, createPipeline } from '@overlay/state';
import type { BrowserWindow } from 'electron';
import { setAdvice } from './advicePanel';
import { setExplanation } from './explanationPanel';
import { pushBridgeUpdate, startBridge, stopBridge } from './ipcBridge';

export interface Coordinator {
  onEvent: (event: HsEvent) => void;
  getState: () => GameState;
  stop: () => void;
  setHsStatus: (s: 'waiting' | 'anchored' | 'failed') => void;
  getHsStatus: () => 'waiting' | 'anchored' | 'failed';
}

export function getRecsForBridge(allRecs: Recommendation[], max = 3): Recommendation[] {
  return allRecs.slice(0, max);
}

export function logTurnSnapshot(
  state: GameState,
  logFn: (kind: string, payload: unknown) => void,
): void {
  logFn('state-snapshot', {
    turn: state.turn,
    phase: state.phase,
    gold: state.player.gold,
    tier: state.player.tier,
    boardSize: state.player.board.minions.length,
    shopSize: state.player.shop.minions.length,
  });
}

export interface CoordinatorOpts {
  logFn?: (kind: string, payload: unknown) => void;
}

function minionSignature(minion: GameState['player']['board']['minions'][number]): string {
  return [
    minion.entityId,
    minion.cardId,
    minion.attack,
    minion.health,
    minion.taunt ? 1 : 0,
    minion.divineShield ? 1 : 0,
    minion.poisonous ? 1 : 0,
    minion.reborn ? 1 : 0,
    minion.frozen ? 1 : 0,
    minion.golden ? 1 : 0,
    minion.windfury ? 1 : 0,
    minion.cleave ? 1 : 0,
    minion.elite ? 1 : 0,
    minion.lifesteal ? 1 : 0,
    minion.exhausted ? 1 : 0,
    minion.magnetic ? 1 : 0,
    minion.immune ? 1 : 0,
    minion.charge ? 1 : 0,
    minion.cost,
    minion.spellPower,
    minion.tribes.join(','),
  ].join(':');
}

export function getAdvisorSignature(state: GameState): string {
  const player = state.player;
  return JSON.stringify({
    turn: state.turn,
    phase: state.phase,
    hp: player.hero.hp,
    gold: player.gold,
    tier: player.tier,
    tierUpCost: player.tierUpCost,
    pendingTriple: player.pendingTriple,
    board: player.board.minions.map(minionSignature),
    shop: {
      frozen: player.shop.frozen,
      rollCost: player.shop.rollCost,
      minions: player.shop.minions.map(minionSignature),
    },
    opponents: state.opponents.map((opp) => ({
      entityId: opp.entityId,
      playerId: opp.playerId,
      hp: opp.hero.hp,
      tier: opp.tier,
      eliminated: opp.eliminated,
      minionsOnBoard: opp.minionsOnBoard,
      board: opp.board.minions.map(minionSignature),
    })),
  });
}

export function shouldRefreshAdvice(state: GameState): boolean {
  return state.phase === 'shopping';
}

const ADVISOR_DEBOUNCE_MS = 150;

export function startCoordinator(win: BrowserWindow, opts?: CoordinatorOpts): Coordinator {
  const pipeline: Pipeline = createPipeline();
  let previousTurn: number | null = null;
  let hsStatus: 'waiting' | 'anchored' | 'failed' = 'waiting';
  let latestRecs: Recommendation[] = [];
  let lastAdvisorSignature: string | null = null;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  function runAdvisor(state: GameState): void {
    const currentTurn = state.turn;
    try {
      const recs = recommend(state);
      latestRecs = recs;
      const top = recs[0];
      if (top) {
        setAdvice(top);
        if (top.action.type === 'Reposition') {
          setBoardPanel({ recommendation: top });
        } else {
          clearBoardPanel();
        }
        if (top.needsExplanation === true) {
          const logFn = opts?.logFn;
          explain(top, state)
            .then((text) => {
              setExplanation(text);
              pushBridgeUpdate();
              logFn?.('llm', { rec: top.action.type, text });
            })
            .catch(() => {
              logFn?.('llm-error', { rec: top.action.type });
            });
        }
      } else {
        setAdvice(null);
        clearBoardPanel();
      }
      (opts?.logFn ?? appendSessionEvent)('recommendation', {
        turn: currentTurn,
        action: recs[0]?.action ?? null,
      });
    } catch {
      latestRecs = [];
      setAdvice(null);
      clearBoardPanel();
    }
    pushBridgeUpdate();
  }

  // Wire onEvent to call recommend + setAdvice on each event
  const originalOnEvent = pipeline.onEvent;
  pipeline.onEvent = (event: HsEvent) => {
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

    if (!shouldRefreshAdvice(state)) {
      if (debounceTimer !== null) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
      }
      if (lastAdvisorSignature !== null || latestRecs.length > 0) {
        lastAdvisorSignature = null;
        latestRecs = [];
        setAdvice(null);
        clearBoardPanel();
        (opts?.logFn ?? appendSessionEvent)('recommendation', {
          turn: currentTurn,
          action: null,
        });
      }
      pushBridgeUpdate();
      return;
    }

    // Always push a state/board/shop update immediately for liveness
    pushBridgeUpdate();

    const advisorSignature = getAdvisorSignature(state);
    if (advisorSignature !== lastAdvisorSignature) {
      lastAdvisorSignature = advisorSignature;
      // Debounce advisor to batch rapid event bursts (e.g. shop populate at turn start)
      if (debounceTimer !== null) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        debounceTimer = null;
        runAdvisor(pipeline.getState());
      }, ADVISOR_DEBOUNCE_MS);
    }
  };

  const coordinator: Coordinator = {
    onEvent: pipeline.onEvent,
    getState: pipeline.getState,
    setHsStatus(s: 'waiting' | 'anchored' | 'failed'): void {
      hsStatus = s;
      pushBridgeUpdate();
    },
    getHsStatus(): 'waiting' | 'anchored' | 'failed' {
      return hsStatus;
    },
    stop(): void {
      if (debounceTimer !== null) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
      }
      stopBridge();
    },
  };

  // Start the IPC bridge so the renderer gets state/recs updates
  startBridge(
    win,
    pipeline.getState,
    () => (latestRecs.length > 0 ? latestRecs : null),
    () => null,
    coordinator.getHsStatus,
    () => debounceTimer !== null,
  );

  return coordinator;
}
