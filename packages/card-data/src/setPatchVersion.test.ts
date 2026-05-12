import { describe, expect, it } from 'bun:test';
import { writeFileSync } from 'node:fs';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { setPatchVersion } from './setPatchVersion';

describe('setPatchVersion', () => {
  it('writes a new version to PATCH.txt and it is readable back', () => {
    const original = readFileSync(join(__dirname, '..', 'PATCH.txt'), 'utf-8').trim();
    try {
      setPatchVersion('31.0.0');
      expect(readFileSync(join(__dirname, '..', 'PATCH.txt'), 'utf-8').trim()).toBe('31.0.0');
    } finally {
      writeFileSync(join(__dirname, '..', 'PATCH.txt'), original + '\n', 'utf-8');
    }
  });
});
