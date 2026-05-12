import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Card } from './types';

const CARDS_PATH = join(import.meta.dirname, '..', 'cards.json');

let cached: Card[] | null = null;

export function loadCards(): Card[] {
  if (cached) return cached;
  if (!existsSync(CARDS_PATH)) {
    cached = [];
    return cached;
  }
  const raw = JSON.parse(readFileSync(CARDS_PATH, 'utf8')) as unknown[];
  cached = raw.map((r) => {
    const c = r as Record<string, unknown>;
    return {
      dbfId: c['dbfId'] as number,
      id: c['id'] as string,
      name: c['name'] as string,
      cardClass: (c['cardClass'] as string | undefined) ?? 'NEUTRAL',
      cost: (c['cost'] as number | undefined) ?? 0,
      attack: c['attack'] as number | undefined,
      health: c['health'] as number | undefined,
      race: c['race'] as string | undefined,
      techLevel: c['techLevel'] as number | undefined,
      mechanics: c['mechanics'] as string[] | undefined,
    } satisfies Card;
  });
  return cached;
}
