import { readFileSync } from 'node:fs';
import { parseLine } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';
import { initialState } from './initialState';
import { reducer } from './reducer';

/**
 * Replay a raw Power.log fixture file through the state reducer and
 * return the final `GameState`.
 *
 * This is the core testing helper for offline fixture-based validation:
 * write a real Power.log snippet to `fixtures/`, then call
 * `replayFixture('fixtures/turn-1.log')` to get the resulting state.
 */
export function replayFixture(filePath: string): GameState {
  const raw = readFileSync(filePath, 'utf8');
  const lines = raw.split('\n');

  let state = initialState();

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const event = parseLine(trimmed);
    if (event) {
      state = reducer(state, event);
    }
  }

  return state;
}
