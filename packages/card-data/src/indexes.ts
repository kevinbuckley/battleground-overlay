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
  if (byTierCache) {
    let result = byTierCache.get(tier);
    if (!result) {
      result = [];
      byTierCache.set(tier, result);
    }
    return result;
  }
  const map = new Map<number, Card[]>();
  for (const card of loadCards()) {
    if (card.techLevel) {
      const existing = map.get(card.techLevel) ?? [];
      existing.push(card);
      map.set(card.techLevel, existing);
    }
  }
  byTierCache = map;
  let result = byTierCache.get(tier);
  if (!result) {
    result = [];
    byTierCache.set(tier, result);
  }
  return result;
}

let byIdCache: Map<string, Card> | null = null;

export function getByDbfIdStr(): Map<string, Card> {
  if (byIdCache) return byIdCache;
  byIdCache = new Map(loadCards().map((c) => [c.id, c]));
  return byIdCache;
}

let byTechLevelCache: Map<number, Card[]> | null = null;

export function getCardsByTechLevel(level: number): Card[] {
  if (!byTechLevelCache) {
    const map = new Map<number, Card[]>();
    for (const card of loadCards()) {
      if (card.techLevel) {
        const existing = map.get(card.techLevel) ?? [];
        existing.push(card);
        map.set(card.techLevel, existing);
      }
    }
    byTechLevelCache = map;
  }
  let result = byTechLevelCache.get(level);
  if (!result) {
    result = [];
    byTechLevelCache.set(level, result);
  }
  return result;
}

export function getCardById(cardId: string): Card | null {
  return getByDbfIdStr().get(cardId) ?? null;
}
