import { describe, expect, it } from 'bun:test';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { waitForLogFile } from './waitForLogFile';

describe('waitForLogFile', () => {
  it('resolves true immediately when file already exists', async () => {
    const tmp = mkdtempSync(join(tmpdir(), 'wfl-'));
    const filePath = join(tmp, 'Power.log');
    writeFileSync(filePath, '');

    const result = await waitForLogFile(filePath, {
      existsFn: () => true,
    });
    expect(result).toBe(true);

    rmSync(tmp, { recursive: true });
  });

  it('resolves false on timeout when file never appears', async () => {
    const result = await waitForLogFile('/tmp/nonexistent-wfl-xyz', {
      timeoutMs: 20,
      intervalMs: 10,
      existsFn: () => false,
    });
    expect(result).toBe(false);
  });

  it('resolves true when file appears after some polls', async () => {
    const tmp = mkdtempSync(join(tmpdir(), 'wfl-'));
    const filePath = join(tmp, 'Power.log');
    let called = 0;

    const result = await waitForLogFile(filePath, {
      timeoutMs: 5000,
      intervalMs: 10,
      existsFn: (p) => {
        called++;
        if (called >= 3) {
          writeFileSync(p, '');
          return true;
        }
        return false;
      },
    });
    expect(result).toBe(true);

    rmSync(tmp, { recursive: true });
  });
});
