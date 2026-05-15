import type { StreamHandle } from '@overlay/log-parser';
import { appendSessionEvent } from '@overlay/shared';
import type { BrowserWindow } from 'electron';
import { anchorToHearthstoneWithRetry, isHearthstoneRunning } from './anchor';
import type { Coordinator } from './coordinator';
import { startCoordinator } from './coordinator';
import { formatStartupBanner, runDoctor } from './doctor';
import { verifyHsLoggingConfig } from './hsLogConfig';
import { wireLogStreamWithRetry } from './logStream';

export interface BootstrapDeps {
  runDoctor?: typeof runDoctor;
  anchorFn?: typeof anchorToHearthstoneWithRetry;
  wireFn?: typeof wireLogStreamWithRetry;
  logFn?: (kind: string, payload: unknown) => void;
}

export interface BootstrapResult {
  coordinator: Coordinator;
  streamHandle: StreamHandle | null;
}

export async function bootstrapOverlay(
  win: BrowserWindow,
  deps?: BootstrapDeps,
): Promise<BootstrapResult> {
  const logFn = deps?.logFn ?? appendSessionEvent;
  const coordinator: Coordinator = startCoordinator(win);

  // 1. Run the startup health check
  const doctorFn = deps?.runDoctor ?? runDoctor;
  const { checkMlxServer } = await import('@overlay/llm');
  const doctorResult = await doctorFn({
    isHsRunning: isHearthstoneRunning,
    verifyConfig: verifyHsLoggingConfig,
    checkMlx: checkMlxServer,
  });
  logFn('doctor', doctorResult);
  win.webContents.send('overlay:startup-banner', formatStartupBanner(doctorResult));

  // 2. Anchor the overlay to the Hearthstone window (with retry)
  const anchor = deps?.anchorFn ?? anchorToHearthstoneWithRetry;
  const anchored = await anchor(win, { maxAttempts: 3, retryMs: 500 });
  coordinator.setHsStatus(anchored ? 'anchored' : 'failed');

  // 3. Wire the log stream (with retry)
  const wireFn = deps?.wireFn ?? wireLogStreamWithRetry;
  const streamHandle = await wireFn(coordinator.onEvent, { maxAttempts: 3, retryMs: 500 });

  return { coordinator, streamHandle };
}
