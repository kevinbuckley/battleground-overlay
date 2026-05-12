import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PATCH_FILE = join(__dirname, '..', 'PATCH.txt');

export function setPatchVersion(version: string): void {
  writeFileSync(PATCH_FILE, `${version}\n`, 'utf-8');
}
