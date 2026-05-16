import { readFileSync } from 'node:fs';
import { parseLine } from '@overlay/log-parser';
import { initialState, reducer } from '@overlay/state';
import type { GameState } from '@overlay/shared';

export interface ReplayTurnSnapshot {
  turn: number;
  phase: GameState['phase'];
  gold: number;
  tier: number;
  hp: number;
  boardSize: number;
  shopSize: number;
  opponents: number;
}

export interface ReplayFixtureSummary {
  events: number;
  finalState: GameState;
  turns: ReplayTurnSnapshot[];
}

function snapshot(state: GameState): ReplayTurnSnapshot {
  return {
    turn: state.turn,
    phase: state.phase,
    gold: state.player.gold,
    tier: state.player.tier,
    hp: state.player.hero.hp,
    boardSize: state.player.board.minions.length,
    shopSize: state.player.shop.minions.length,
    opponents: state.opponents.length,
  };
}

export function replayFixtureSummary(filePath: string): ReplayFixtureSummary {
  const raw = readFileSync(filePath, 'utf8');
  let state = initialState();
  let events = 0;
  const turns: ReplayTurnSnapshot[] = [];
  let lastTurn = state.turn;

  for (const line of raw.split('\n')) {
    const event = parseLine(line);
    if (!event) continue;
    events++;
    state = reducer(state, event);
    if (state.turn !== lastTurn) {
      turns.push(snapshot(state));
      lastTurn = state.turn;
    }
  }

  return { events, finalState: state, turns };
}

export function formatReplayFixtureSummary(summary: ReplayFixtureSummary): string {
  const final = snapshot(summary.finalState);
  return [
    `events: ${summary.events}`,
    `final: turn=${final.turn} phase=${final.phase} tier=${final.tier} hp=${final.hp} board=${final.boardSize} shop=${final.shopSize} opponents=${final.opponents}`,
    ...summary.turns.map(
      (t) =>
        `turn ${t.turn}: phase=${t.phase} tier=${t.tier} gold=${t.gold} hp=${t.hp} board=${t.boardSize} shop=${t.shopSize} opponents=${t.opponents}`,
    ),
  ].join('\n');
}

if (import.meta.main) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: bun scripts/replay-fixture.ts <fixture>');
    process.exit(1);
  }
  console.log(formatReplayFixtureSummary(replayFixtureSummary(filePath)));
}
