import type { HsEvent, StreamHandle } from '@overlay/log-parser';
import type { BrowserWindow } from 'electron';
import type { Coordinator } from './coordinator';
import { startCoordinator } from './coordinator';
import { wireLogStream } from './logStream';

export interface BootstrapDeps {
  streamFactory?: (onEvent: (e: HsEvent) => void) => Promise<StreamHandle | null>;
}

export interface BootstrapResult {
  coordinator: Coordinator;
  streamHandle: StreamHandle | null;
}

export async function bootstrapOverlay(
  win: BrowserWindow,
  deps?: BootstrapDeps,
): Promise<BootstrapResult> {
  const coordinator: Coordinator = startCoordinator(win);

  const streamHandle = await (deps?.streamFactory ?? wireLogStream)(coordinator.onEvent);

  return { coordinator, streamHandle };
}
