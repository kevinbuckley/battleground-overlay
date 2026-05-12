import { loadCards } from './loadCards';
import type { Card } from './types';

let byDbfIdCache: Map<number, Card> | null = null;
let byTribeCache: Map<string, Card[]> | null = null;
let byTierCache: Map<number, Card[]> | null = null;

export function getByDbfId(): Map<number, Card> {
  if (byDbfIdCache) return byDbfIdCache;
  byDbfIdCache = new Map(loadCards().map((c) => [c.dbfId, c]));
  return byDbfIdCache;
}

export function getCard(dbfId: number): Card | null {
  return getByDbfId().get(dbfId) ?? null;
}

export function getCardsByTribe(tribe: string): Card[] {
  if (!byTribeCache) {
    const map = new Map<string, Card[]>();
    for (const card of loadCards()) {
      if (card.race) {
        const existing = map.get(card.race) ?? [];
        existing.push(card);
        map.set(card.race, existing);
      }
    }
    byTribeCache = map;
  }
  let result = byTribeCache.get(tribe);
  if (!result) {
    result = [];
    byTribeCache.set(tribe, result);
  }
  return result;
}

export function getCardsByTier(tier: number): Card[] {
  if (!byTierCache) {
    const map = new Map<number, Card[]>();
    for (const card of loadCards()) {
      if (card.techLevel) {
        const existing = map.get(card.techLevel) ?? [];
        existing.push(card);
        map.set(card.techLevel, existing);
      }
    }
    byTierCache = map;
  }
  let result = byTierCache.get(tier);
  if (!result) {
    result = [];
    byTierCache.set(tier, result);
  }
  return result;
}
