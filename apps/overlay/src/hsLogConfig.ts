import { readFileSync } from 'node:fs';

const REQUIRED_SECTIONS = ['Power', 'Zone', 'Bob', 'LoadingScreen', 'Asset', 'Net.Mgr'];

export function verifyHsLoggingConfig(
  configPath: string,
  readFn: (p: string) => string = (p: string) => readFileSync(p, 'utf-8'),
): { ok: boolean; missingSections: string[] } {
  let text: string;
  try {
    text = readFn(configPath);
  } catch {
    return { ok: false, missingSections: ['<error reading file>'] };
  }

  const missing: string[] = [];
  for (const section of REQUIRED_SECTIONS) {
    if (!text.includes(`[${section}]`)) {
      missing.push(section);
    }
  }

  return { ok: missing.length === 0, missingSections: missing };
}
