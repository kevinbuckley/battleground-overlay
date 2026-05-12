import { expect, test } from 'bun:test';
import { formatEntry } from './review-session';

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
