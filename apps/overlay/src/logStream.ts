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

  let handle: StreamHandle | null = null;
  let currentPath: string | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    handle = await wireFn(onEvent, opts?.logBaseDir);
    if (handle !== null) {
      try {
        currentPath = join(findActiveLogDir(opts?.logBaseDir), 'Power.log');
      } catch {
        currentPath = null;
      }
      break;
    }
    if (attempt < maxAttempts - 1) {
      await new Promise((r) => setTimeout(r, retryMs));
    }
  }
  if (handle === null) return null;

  // Watch for log rotation: every 3s, ask findActiveLogDir whether HS has
  // started a newer Power.log (e.g. on game restart). If so, swap our tail.
  const rotationTimer = setInterval(async () => {
    try {
      const candidate = join(findActiveLogDir(opts?.logBaseDir), 'Power.log');
      if (!existsSync(candidate)) return;
      if (candidate === currentPath) return;
      // Switch: close old handle, open new one.
      const newHandle = await wireFn(onEvent, opts?.logBaseDir);
      if (newHandle !== null) {
        handle?.close();
        handle = newHandle;
        currentPath = candidate;
      }
    } catch {
      // ignore — we'll retry on the next tick
    }
  }, 3000);

  return {
    close: () => {
      clearInterval(rotationTimer);
      handle?.close();
    },
  };
}
