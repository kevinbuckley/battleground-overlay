import { loadCards } from './loadCards';
import type { Card } from './types';

let byDbfIdCache: Map<number, Card> | null = null;

export function getByDbfId(): Map<number, Card> {
  if (byDbfIdCache) return byDbfIdCache;
  byDbfIdCache = new Map(loadCards().map((c) => [c.dbfId, c]));
  return byDbfIdCache;
}

export function getCard(dbfId: number): Card | null {
  return getByDbfId().get(dbfId) ?? null;
}
