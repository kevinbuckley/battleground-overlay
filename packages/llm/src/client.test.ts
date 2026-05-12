import { afterEach, describe, expect, it } from 'bun:test';
import { chatCompletion } from './client';

// Save original fetch
const _origFetch = global.fetch;

afterEach(() => {
  global.fetch = _origFetch;
});

describe('chatCompletion', () => {
  it('POSTs to the correct URL with model and messages', async () => {
    let capturedUrl = '';
    let capturedOpts = {} as { method: string; headers: Record<string, string>; body: string };
    (global.fetch as unknown as typeof fetch) = (
      url: string,
      opts: { method: string; headers: Record<string, string>; body: string },
    ) => {
      capturedUrl = url;
      capturedOpts = opts;
      return Promise.resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () =>
          Promise.resolve({
            choices: [{ message: { content: 'Because it has 3/4 and a Taunt.' } }],
          }),
      });
    };

    await chatCompletion([
      { role: 'system', content: 'You are a Hearthstone advisor.' },
      { role: 'user', content: 'Why this minion?' },
    ]);

    expect(capturedUrl).toBe('http://localhost:8080/v1/chat/completions');
    expect(capturedOpts.method).toBe('POST');
    expect(capturedOpts.headers).toEqual({ 'Content-Type': 'application/json' });
    const body = JSON.parse(capturedOpts.body);
    expect(body.model).toBe('Qwen3.6-35B-A3B-4bit');
    expect(body.messages).toEqual([
      { role: 'system', content: 'You are a Hearthstone advisor.' },
      { role: 'user', content: 'Why this minion?' },
    ]);
  });

  it('returns { text } from the response', async () => {
    (global.fetch as unknown as typeof fetch) = () =>
      Promise.resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () =>
          Promise.resolve({
            choices: [{ message: { content: 'Because it has 3/4 and a Taunt.' } }],
          }),
      });

    const result = await chatCompletion([{ role: 'user', content: 'test' }]);
    expect(result).toEqual({ text: 'Because it has 3/4 and a Taunt.' });
  });

  it('throws on non-2xx response', async () => {
    (global.fetch as unknown as typeof fetch) = () =>
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

    await expect(chatCompletion([{ role: 'user', content: 'test' }])).rejects.toThrow(
      'LLM chatCompletion failed: 500 Internal Server Error',
    );
  });

  it('uses custom baseUrl when provided', async () => {
    let capturedUrl = '';
    (global.fetch as unknown as typeof fetch) = (url: string) => {
      capturedUrl = url;
      return Promise.resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () =>
          Promise.resolve({
            choices: [{ message: { content: 'x' } }],
          }),
      });
    };

    await chatCompletion([{ role: 'user', content: 'test' }], { baseUrl: 'http://custom:9999' });

    expect(capturedUrl).toBe('http://custom:9999/v1/chat/completions');
  });

  it('uses custom model when provided', async () => {
    let capturedBody = '';
    (global.fetch as unknown as typeof fetch) = (_url: string, opts: { body: string }) => {
      capturedBody = opts.body;
      return Promise.resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () =>
          Promise.resolve({
            choices: [{ message: { content: 'x' } }],
          }),
      });
    };

    await chatCompletion([{ role: 'user', content: 'test' }], { model: 'test-model' });

    const body = JSON.parse(capturedBody);
    expect(body.model).toBe('test-model');
  });

  it('returns empty text when response has no choices', async () => {
    (global.fetch as unknown as typeof fetch) = () =>
      Promise.resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve({ choices: [] }),
      });

    const result = await chatCompletion([{ role: 'user', content: 'test' }]);
    expect(result).toEqual({ text: '' });
  });
});
