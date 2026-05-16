import { expect, test } from 'bun:test';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { formatReplayFixtureSummary, replayFixtureSummary } from './replay-fixture';

test('replayFixtureSummary replays raw prefixed Power.log lines', () => {
  const dir = mkdtempSync(join(tmpdir(), 'replay-fixture-'));
  try {
    const path = join(dir, 'fixture.power.txt');
    writeFileSync(
      path,
      [
        'D 14:22:07.8627960 GameState.DebugPrintPower() -     Player EntityID=17 PlayerID=6 GameAccountId=[hi=1 lo=1]',
        'D 14:22:07.8627960 GameState.DebugPrintGame() - PlayerID=6, PlayerName=LOCAL_PLAYER',
        'D 14:22:08.1636210 GameState.DebugPrintPower() - TAG_CHANGE Entity=GameEntity tag=NUM_TURNS_IN_PLAY value=1 ',
        'D 14:22:08.1636210 GameState.DebugPrintPower() - TAG_CHANGE Entity=GameEntity tag=STEP value=MAIN_READY ',
        'D 14:22:08.1636210 GameState.DebugPrintPower() - TAG_CHANGE Entity=17 tag=PLAYER_TECH_LEVEL value=2 ',
      ].join('\n'),
    );

    const summary = replayFixtureSummary(path);
    expect(summary.events).toBe(5);
    expect(summary.finalState.turn).toBe(1);
    expect(summary.finalState.phase).toBe('shopping');
    expect(summary.finalState.player.name).toBe('LOCAL_PLAYER');
    expect(summary.finalState.player.tier).toBe(2);
    expect(formatReplayFixtureSummary(summary)).toContain('events: 5');
  } finally {
    rmSync(dir, { recursive: true });
  }
});
