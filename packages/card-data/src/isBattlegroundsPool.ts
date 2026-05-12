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

export function isBattlegroundsPool(card: Card): boolean {
  if (card.techLevel !== undefined && card.techLevel >= 1) {
    return true;
  }
  if (card.mechanics) {
    return card.mechanics.some((m) => BG_MECHANICS.has(m));
  }
  return false;
}
