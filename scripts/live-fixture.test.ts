import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { replayFixtureSummary } from './replay-fixture';

const LIVE_FIXTURE = join(
  import.meta.dirname,
  '..',
  'fixtures',
  'bg-live-2026-05-16-142112.power.txt',
);

test('sanitized live BG fixture replays through the state reducer', () => {
  const summary = replayFixtureSummary(LIVE_FIXTURE);

  expect(summary.events).toBeGreaterThan(20_000);
  expect(summary.finalState.turn).toBeGreaterThanOrEqual(10);
  expect(summary.finalState.player.playerId).toBeGreaterThan(0);
  expect(summary.finalState.player.name).toBe('LOCAL_PLAYER');
  expect(summary.finalState.player.board.minions).toHaveLength(7);
  expect(summary.finalState.player.shop.minions).toHaveLength(5);
  expect(summary.finalState.opponents).toHaveLength(7);
  expect(summary.turns.length).toBeGreaterThanOrEqual(10);
});

test('sanitized live BG fixture does not contain known raw account identifiers', () => {
  const content = readFileSync(LIVE_FIXTURE, 'utf8');

  expect(content).toContain('LOCAL_PLAYER');
  expect(content).toContain('OPPONENT_');
  expect(content).not.toContain('kbux#11815');
  expect(content).not.toContain('144115193835963207');
  expect(content).not.toContain('52421247');
});
