import { getCardsByTribe } from './indexes';
import type { Card } from './types';

const BG_MECHANICS = new Set([
  'BATTLEGROUND_MINION_TIER_1',
  'BATTLEGROUND_MINION_TIER_2',
  'BATTLEGROUND_MINION_TIER_3',
  'BATTLEGROUND_MINION_TIER_4',
  'BATTLEGROUND_MINION_TIER_5',
  'BATTLEGROUND_MINION_TIER_6',
  'BATTLEGROUND_MINION_TIER_7',
]);

let bgByTribeCache: Map<string, Card[]> | null = null;

export function isBattlegroundsPool(card: Card): boolean {
  if (card.techLevel !== undefined && card.techLevel >= 1) {
    return true;
  }
  if (card.mechanics) {
    return card.mechanics.some((m) => BG_MECHANICS.has(m));
  }
  return false;
}

export function isBattlegroundsMinion(card: Card): boolean {
  if (card.mechanics?.includes('DUNGEON_PASSIVE_BUFF')) {
    return false;
  }
  if (card.techLevel !== undefined && card.techLevel >= 1 && card.techLevel <= 6) {
    return true;
  }
  return false;
}

export function getBgMinionsByTribe(tribe: string): Card[] {
  if (!bgByTribeCache) {
    const tribeCards = getCardsByTribe(tribe);
    const filtered = tribeCards.filter(isBattlegroundsPool);
    bgByTribeCache = new Map([[tribe, filtered]]);
  }
  let result = bgByTribeCache.get(tribe);
  if (!result) {
    const tribeCards = getCardsByTribe(tribe);
    result = tribeCards.filter(isBattlegroundsPool);
    bgByTribeCache.set(tribe, result);
  }
  return result;
}
