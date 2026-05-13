import { describe, expect, it } from 'bun:test';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fetchCards } from './fetchCards';

describe('fetchCards', () => {
  const tmpDir = join('/tmp', `fetch-cards-test-${Date.now()}`);
  const outPath = join(tmpDir, 'cards.json');

  function setup() {
    if (existsSync(tmpDir)) rmSync(tmpDir, { recursive: true });
    mkdirSync(tmpDir, { recursive: true });
  }

  function teardown() {
    if (existsSync(tmpDir)) rmSync(tmpDir, { recursive: true });
  }

  it('fetches from the correct URL and writes the file', async () => {
    setup();
    const mockBody = JSON.stringify([{ dbfId: 1, name: 'Test' }]);
    const originalFetch = globalThis.fetch;
    let capturedUrl: string | undefined;
    const mockFn = async (url: string | URL | Request) => {
      capturedUrl = url.toString();
      return {
        ok: true,
        status: 200,
        text: async () => mockBody,
      } as Response;
    };
    globalThis.fetch = mockFn as unknown as typeof fetch;
    try {
      await fetchCards('30.4.3', outPath);
      expect(capturedUrl).toBe(
        'https://api.hearthstonejson.com/v1/30.4.3/enUS/cards.collectible.json',
      );
      expect(existsSync(outPath)).toBe(true);
      const written = JSON.parse(readFileSync(outPath, 'utf8'));
      expect(written).toEqual([{ dbfId: 1, name: 'Test' }]);
    } finally {
      globalThis.fetch = originalFetch;
      teardown();
    }
  });

  it('throws on non-2xx response', async () => {
    setup();
    const originalFetch = globalThis.fetch;
    const mockFn = async () =>
      ({
        ok: false,
        status: 404,
        text: async () => '',
      }) as Response;
    globalThis.fetch = mockFn as unknown as typeof fetch;
    try {
      await expect(fetchCards('30.4.3', outPath)).rejects.toThrow('fetch-cards: HTTP 404');
    } finally {
      globalThis.fetch = originalFetch;
      teardown();
    }
  });
});
