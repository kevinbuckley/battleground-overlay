import { describe, expect, it } from 'bun:test';
import { checkMlxServer } from './healthCheck';

describe('checkMlxServer', () => {
  it('returns ok=true when fetch resolves with status 200', async () => {
    const result = await checkMlxServer(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve({}),
      } as Response),
    );
    expect(result).toEqual({ ok: true });
  });

  it('returns ok=false with error when fetch resolves with non-200', async () => {
    const result = await checkMlxServer(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response),
    );
    expect(result).toEqual({ ok: false, error: 'status 500' });
  });

  it('returns ok=false with error message when fetch throws', async () => {
    const result = await checkMlxServer(() => Promise.reject(new Error('boom')));
    expect(result).toEqual({ ok: false, error: 'boom' });
  });
});
