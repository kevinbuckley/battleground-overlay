import { existsSync } from 'node:fs';

export async function waitForLogFile(
  filePath: string,
  opts?: {
    intervalMs?: number;
    timeoutMs?: number;
    existsFn?: (p: string) => boolean;
  },
): Promise<boolean> {
  const intervalMs = opts?.intervalMs ?? 500;
  const timeoutMs = opts?.timeoutMs ?? 5000;
  const existsFn = opts?.existsFn ?? existsSync;

  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (existsFn(filePath)) {
      return true;
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return false;
}
