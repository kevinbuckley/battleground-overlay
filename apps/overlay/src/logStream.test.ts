import { describe, expect, it } from 'bun:test';
import { type wireLogStream, wireLogStreamWithRetry } from './logStream';

describe('wireLogStreamWithRetry', () => {
  it('returns handle when first attempt succeeds', async () => {
    const mockHandle = { close: () => {} };
    const mockWire = async () => mockHandle;
    const result = await wireLogStreamWithRetry(() => {}, {
      wireFn: mockWire as typeof wireLogStream,
    });
    expect(result).not.toBeNull();
    result?.close();
  });

  it('returns null after maxAttempts=1 when mock always returns null', async () => {
    const mockWire = async () => null;
    const result = await wireLogStreamWithRetry(() => {}, {
      maxAttempts: 1,
      wireFn: mockWire as typeof wireLogStream,
    });
    expect(result).toBeNull();
  });

  it('retries exactly maxAttempts times when stub returns null both times', async () => {
    let callCount = 0;
    const mockWire = async () => {
      callCount++;
      return null;
    };
    const result = await wireLogStreamWithRetry(() => {}, {
      maxAttempts: 2,
      retryMs: 1,
      wireFn: mockWire as typeof wireLogStream,
    });
    expect(result).toBeNull();
    expect(callCount).toBe(2);
  });
});
