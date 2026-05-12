import { readFileSync } from 'node:fs';
import type { HsEvent } from '@overlay/log-parser';
import { parseBlockEnd, parseBlockStart } from '@overlay/log-parser';
import { parseFullEntity } from '@overlay/log-parser';
import { parseTagChange } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';
import { initialState } from './initialState';
import { reducer } from './reducer';
import { reducer } from './reducer';

function parseSingleLine(line: string): HsEvent | null {
  return (
    parseTagChange(line) ??
    parseFullEntity(line) ??
    parseBlockStart(line) ??
    parseBlockEnd(line) ??
    null
  );
}

export interface SessionSnapshot {
  turn: number;
  phase: string;
  playerHp: number;
  playerGold: number;
  playerTier: number;
  boardSize: number;
}

/**
 * Parse a session JSONL file and replay all events through the state
 * reducer, returning an array of GameState snapshots taken at each
 * turn boundary and at the end of the session.
 *
 * Session JSONL format: `{ "ts": number, "kind": string, "payload": string }`
 * where `payload` is the raw Power.log line.
 */
export function parseSession(filePath: string): GameState[] {
  const raw = readFileSync(filePath, 'utf8');
  const lines = raw.split('\n').filter((l) => l.trim());

  let state = initialState();
  const results: GameState[] = [];

  for (const line of lines) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(line);
    } catch {
      continue;
    }

    const entry = parsed as { kind: string; payload: unknown };
    const payload =
      typeof entry.payload === 'string' ? entry.payload : JSON.stringify(entry.payload);

    const event = parseSingleLine(payload);
    if (event) {
      state = reducer(state, event);
    }

    const isTurnBoundary =
      entry.kind === 'turn_start' || entry.kind === 'turn_end' || entry.kind === 'TAG_CHANGE';

    if (isTurnBoundary || entry.kind === 'session_end') {
      results.push({
        turn: state.turn,
        phase: state.phase,
        player: {
          ...state.player,
          hero: { ...state.player.hero },
          board: { minions: state.player.board.minions.map((m) => ({ ...m })) },
          shop: { ...state.player.shop },
          entityRegistry: new Map(state.player.entityRegistry),
        },
        opponents: state.opponents.map((o) => ({
          ...o,
          hero: { ...o.hero },
          board: { minions: o.board.minions.map((m) => ({ ...m })) },
        })),
      });
    }
  }

  // Always include the final state if we haven't already captured it
  const lastSnapshot = results[results.length - 1];
  if (!lastSnapshot || lastSnapshot.turn !== state.turn || lastSnapshot.phase !== state.phase) {
    results.push({
      turn: state.turn,
      phase: state.phase,
      player: {
        ...state.player,
        hero: { ...state.player.hero },
        board: { minions: state.player.board.minions.map((m) => ({ ...m })) },
        shop: { ...state.player.shop },
        entityRegistry: new Map(state.player.entityRegistry),
      },
      opponents: state.opponents.map((o) => ({
        ...o,
        hero: { ...o.hero },
        board: { minions: o.board.minions.map((m) => ({ ...m })) },
      })),
    });
  }

  return results;
}
