import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const PATCH_FILE = join(__dirname, '..', 'PATCH.txt');

export function patchVersion(): string {
  return readFileSync(PATCH_FILE, 'utf-8').trim();
}
