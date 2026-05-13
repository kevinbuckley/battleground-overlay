import type { HsEvent, StreamHandle } from '@overlay/log-parser';
import { findActiveLogDir, streamEvents } from '@overlay/log-parser';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

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
