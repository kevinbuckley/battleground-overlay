import { expect, test } from 'bun:test';
import { sanitizePowerLog } from './sanitize-power-log';

test('sanitizePowerLog replaces names and account ids while preserving local player detection', () => {
  const raw = [
    'D 14:22:07.8627960 GameState.DebugPrintPower() -     Player EntityID=17 PlayerID=6 GameAccountId=[hi=144115193835963207 lo=52421247]',
    'D 14:22:07.8627960 GameState.DebugPrintPower() -     Player EntityID=18 PlayerID=14 GameAccountId=[hi=0 lo=0]',
    'D 14:22:07.8627960 GameState.DebugPrintGame() - PlayerID=6, PlayerName=kbux#11815',
    'D 14:22:07.8627960 GameState.DebugPrintGame() - PlayerID=14, PlayerName=DruidaLoco',
    'D 14:22:07.8627960 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=kbux#11815 tag=PLAYSTATE value=PLAYING ',
    'D 14:22:07.8627960 PowerTaskList.DebugPrintPower() -     TAG_CHANGE Entity=DruidaLoco tag=PLAYSTATE value=PLAYING ',
  ].join('\n');

  const sanitized = sanitizePowerLog(raw);

  expect(sanitized).not.toContain('kbux#11815');
  expect(sanitized).not.toContain('DruidaLoco');
  expect(sanitized).not.toContain('144115193835963207');
  expect(sanitized).not.toContain('52421247');
  expect(sanitized).toContain('PlayerID=6, PlayerName=LOCAL_PLAYER');
  expect(sanitized).toContain('PlayerID=14, PlayerName=OPPONENT_14');
  expect(sanitized).toContain('GameAccountId=[hi=1 lo=1]');
  expect(sanitized).toContain('GameAccountId=[hi=0 lo=0]');
  expect(sanitized).toContain('Entity=LOCAL_PLAYER');
  expect(sanitized).toContain('Entity=OPPONENT_14');
});
