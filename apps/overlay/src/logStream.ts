import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { HsEvent, StreamHandle } from '@overlay/log-parser';
import { findActiveLogDir, streamEvents } from '@overlay/log-parser';

export async function wireLogStream(
  onEvent: (e: HsEvent) => void,
  logBaseDir?: string,
): Promise<StreamHandle | null> {
  try {
    const logDir = findActiveLogDir(logBaseDir);
    const logPath = join(logDir, 'Power.log');
    if (!existsSync(logPath)) return null;
    return await streamEvents(logPath, onEvent);
  } catch {
    return null;
  }
}

export async function wireLogStreamWithRetry(
  onEvent: (e: HsEvent) => void,
  opts?: {
    logBaseDir?: string;
    maxAttempts?: number;
    retryMs?: number;
    wireFn?: typeof wireLogStream;
  },
): Promise<StreamHandle | null> {
  const wireFn = opts?.wireFn ?? wireLogStream;
  const maxAttempts = opts?.maxAttempts ?? 3;
  const retryMs = opts?.retryMs ?? 2000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await wireFn(onEvent, opts?.logBaseDir);
    if (result !== null) return result;
    if (attempt < maxAttempts - 1) {
      await new Promise((r) => setTimeout(r, retryMs));
    }
  }
  return null;
}
