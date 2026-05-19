import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

export async function fetchCards(patch: string, outPath: string): Promise<void> {
  const url = `https://api.hearthstonejson.com/v1/${patch}/enUS/cards.json`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`fetch-cards: HTTP ${res.status} from ${url}`);
  }
  const data = await res.text();
  if (!existsSync(dirname(outPath))) {
    mkdirSync(dirname(outPath), { recursive: true });
  }
  writeFileSync(outPath, data, 'utf8');
}
