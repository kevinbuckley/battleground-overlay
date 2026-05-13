import { expect, test } from 'bun:test';
import {
  type SessionEntry,
  filterByTurnRange,
  formatEntry,
  formatSessionLine,
  readSession,
} from './review-session';

test('formatEntry: parses kind and payload (object)', () => {
  const line = JSON.stringify({ ts: 1000, kind: 'event', payload: { name: 'test', value: 42 } });
  const result = formatEntry(line);
  expect(result).toContain('[event]');
  expect(result).toContain('name:"test"');
  expect(result).toContain('value:42');
});

test('formatEntry: parses kind and payload (string)', () => {
  const line = JSON.stringify({ ts: 1000, kind: 'log', payload: 'hello world' });
  const result = formatEntry(line);
  expect(result).toBe('[log] hello world');
});

test('formatEntry: truncates long strings', () => {
  const longStr = 'a'.repeat(100);
  const line = JSON.stringify({ ts: 1000, kind: 'log', payload: longStr });
  const result = formatEntry(line);
  expect(result).toBe(`[log] ${'a'.repeat(77)}...`);
});

test('formatEntry: handles null/undefined payload', () => {
  const line1 = JSON.stringify({ ts: 1000, kind: 'event', payload: null });
  expect(formatEntry(line1)).toBe('[event]');

  const line2 = JSON.stringify({ ts: 1000, kind: 'event' });
  expect(formatEntry(line2)).toBe('[event]');
});

test('formatEntry: handles parse errors gracefully', () => {
  const result = formatEntry('not valid json{{{');
  expect(result).toContain('[parse-error]');
});

test('formatEntry: skips empty lines', () => {
  expect(formatEntry('')).toBe('');
  expect(formatEntry('   ')).toBe('');
});

test('formatEntry: handles missing kind', () => {
  const line = JSON.stringify({ ts: 1000, payload: { foo: 'bar' } });
  const result = formatEntry(line);
  expect(result).toContain('[unknown]');
  expect(result).toContain('foo:"bar"');
});

test('reviewSessionLines: formats turn snapshots and recommendations', () => {
  const { reviewSessionLines } = require('./review-session');
  const tmpDir = '/tmp';
  const filePath = `${tmpDir}/test-session-${Date.now()}.jsonl`;
  const entries = [
    JSON.stringify({
      ts: 1000,
      kind: 'state_snapshot',
      payload: { turn: 1, phase: 'shopping', boardSize: 3 },
    }),
    JSON.stringify({
      ts: 1001,
      kind: 'state_snapshot',
      payload: { turn: 2, phase: 'shopping', boardSize: 5 },
    }),
    JSON.stringify({
      ts: 1002,
      kind: 'recommendation',
      payload: { turn: 2, action: 'Buy', cardId: 'TB_BaconShop_1' },
    }),
  ];
  require('node:fs').writeFileSync(filePath, entries.join('\n'));
  const lines = reviewSessionLines(filePath);
  expect(lines.length).toBe(3);
  const combined = lines.join(' ');
  expect(combined).toContain('state_snapshot');
  expect(combined).toContain('recommendation');
  expect(combined).toContain('Buy');
  expect(combined).toContain('TB_BaconShop_1');
  require('node:fs').unlinkSync(filePath);
});

test('filterByTurnRange: entries in range are returned', () => {
  const entries: SessionEntry[] = [
    { ts: 1, kind: 'state_snapshot', payload: { turn: 1, phase: 'shopping' } },
    { ts: 2, kind: 'state_snapshot', payload: { turn: 3, phase: 'combat' } },
    { ts: 3, kind: 'state_snapshot', payload: { turn: 5, phase: 'shopping' } },
    { ts: 4, kind: 'state_snapshot', payload: { turn: 7, phase: 'combat' } },
  ];
  const result = filterByTurnRange(entries, 2, 5);
  expect(result.length).toBe(2);
  expect(result[0].payload).toEqual({ turn: 3, phase: 'combat' });
  expect(result[1].payload).toEqual({ turn: 5, phase: 'shopping' });
});

test('filterByTurnRange: entries outside range are excluded', () => {
  const entries: SessionEntry[] = [
    { ts: 1, kind: 'state_snapshot', payload: { turn: 1, phase: 'shopping' } },
    { ts: 2, kind: 'state_snapshot', payload: { turn: 3, phase: 'combat' } },
    { ts: 3, kind: 'state_snapshot', payload: { turn: 10, phase: 'shopping' } },
  ];
  const result = filterByTurnRange(entries, 2, 5);
  expect(result.length).toBe(1);
  expect((result[0].payload as { turn: number }).turn).toBe(3);
});

test('filterByTurnRange: empty input returns empty array', () => {
  const result = filterByTurnRange([], 1, 10);
  expect(result).toEqual([]);
});

test('filterByTurnRange: entries without turn field are excluded', () => {
  const entries: SessionEntry[] = [
    { ts: 1, kind: 'recommendation', payload: { action: 'Buy', cardId: 'TB_BaconShop_1' } },
    { ts: 2, kind: 'state_snapshot', payload: { turn: 3, phase: 'shopping' } },
  ];
  const result = filterByTurnRange(entries, 1, 10);
  expect(result.length).toBe(1);
  expect((result[0].payload as { turn: number }).turn).toBe(3);
});

test('filterByTurnRange: boundary values included', () => {
  const entries: SessionEntry[] = [
    { ts: 1, kind: 'state_snapshot', payload: { turn: 2, phase: 'shopping' } },
    { ts: 2, kind: 'state_snapshot', payload: { turn: 5, phase: 'combat' } },
  ];
  const result = filterByTurnRange(entries, 2, 5);
  expect(result.length).toBe(2);
});

test('formatSessionLine: recommendation entry', () => {
  const entry: SessionEntry = {
    ts: 1715000000,
    kind: 'recommendation',
    payload: { turn: 5, action: 'Buy', cardId: 'TB_BaconShop_1' },
  };
  const result = formatSessionLine(entry);
  expect(result).toContain('[recommendation]');
  expect(result).toContain('TB_BaconShop_1');
  expect(result).toContain('Buy');
});

test('formatSessionLine: state-snapshot entry', () => {
  const entry: SessionEntry = {
    ts: 1715000000,
    kind: 'state-snapshot',
    payload: { turn: 3, phase: 'shopping', gold: 4, tier: 3 },
  };
  const result = formatSessionLine(entry);
  expect(result).toContain('[state-snapshot]');
  expect(result).toContain('turn');
  expect(result).toContain('3');
  expect(result).toContain('shopping');
});

test('formatSessionLine: empty-payload entry', () => {
  const entry: SessionEntry = {
    ts: 1715000000,
    kind: 'event',
    payload: null,
  };
  const result = formatSessionLine(entry);
  expect(result).toContain('[event]');
  expect(result).not.toContain('null');
});
