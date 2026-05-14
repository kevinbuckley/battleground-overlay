import { execSync } from 'node:child_process';
import type { BrowserWindow } from 'electron';

const HEARTHSTONE_PROCESS_NAME = 'Hearthstone';

interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

function findHearthstoneBounds(): WindowBounds | null {
  try {
    const escapedName = HEARTHSTONE_PROCESS_NAME.replace(/'/g, "\\'");
    const script = `
      tell application "System Events"
        set hsProcess to first process whose name contains "${escapedName}"
        set hsWindow to first window of hsProcess
        get {position of hsWindow, size of hsWindow}
      end tell
    `;
    const result = execSync(`osascript -e '${script}'`, {
      encoding: 'utf-8',
      timeout: 3000,
    }).trim();

    const parts = result.split(', ');
    if (parts.length < 2) return null;

    const posStr = parts[0];
    const sizeStr = parts[1];

    if (!posStr || !sizeStr) return null;

    const pos = posStr.split(',').map(Number);
    const size = sizeStr.split(',').map(Number);

    if (pos.length < 2 || size.length < 2) return null;

    const px = pos[0] as number;
    const py = pos[1] as number;
    const pw = size[0] as number;
    const ph = size[1] as number;

    if (Number.isNaN(px) || Number.isNaN(py) || Number.isNaN(pw) || Number.isNaN(ph)) {
      return null;
    }

    return { x: px, y: py, width: pw, height: ph };
  } catch {
    return null;
  }
}

export function anchorToHearthstone(
  win: BrowserWindow,
  offsetPixels: { x?: number; y?: number; widthOffset?: number; heightOffset?: number } = {},
): boolean {
  const bounds = findHearthstoneBounds();
  if (!bounds) return false;

  const offsetX = offsetPixels.x ?? 0;
  const offsetY = offsetPixels.y ?? 0;
  const widthOffset = offsetPixels.widthOffset ?? 0;
  const heightOffset = offsetPixels.heightOffset ?? 0;

  const finalX = bounds.x + offsetX;
  const finalY = bounds.y + offsetY;
  const finalW = Math.max(100, bounds.width + widthOffset);
  const finalH = Math.max(100, bounds.height + heightOffset);

  win.setBounds({
    x: finalX,
    y: finalY,
    width: finalW,
    height: finalH,
  });

  return true;
}

export function getHearthstoneBounds(): WindowBounds | null {
  return findHearthstoneBounds();
}

export function isHearthstoneRunning(
  execFn: (cmd: string) => string = (cmd: string) =>
    execSync(cmd, { encoding: 'utf-8' }).toString(),
): boolean {
  try {
    const result = execFn(`pgrep -x ${HEARTHSTONE_PROCESS_NAME}`);
    return result.trim().length > 0;
  } catch {
    return false;
  }
}

let anchorStatus: 'waiting' | 'anchored' | 'failed' = 'waiting';

export function setAnchorStatus(s: 'waiting' | 'anchored' | 'failed'): void {
  anchorStatus = s;
}

export function getAnchorStatus(): 'waiting' | 'anchored' | 'failed' {
  return anchorStatus;
}

export async function anchorToHearthstoneWithRetry(
  win: BrowserWindow,
  opts?: {
    maxAttempts?: number;
    retryMs?: number;
    offsets?: { x?: number; y?: number; widthOffset?: number; heightOffset?: number };
  },
  anchorFn?: typeof anchorToHearthstone,
): Promise<boolean> {
  const maxAttempts = opts?.maxAttempts ?? 5;
  const retryMs = opts?.retryMs ?? 1000;
  const offsets = opts?.offsets;
  const fn = anchorFn ?? anchorToHearthstone;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const success = fn(win, offsets);
    if (success) return true;
    if (attempt < maxAttempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, retryMs));
    }
  }

  return false;
}
