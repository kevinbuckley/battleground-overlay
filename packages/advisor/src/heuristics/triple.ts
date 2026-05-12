import type { Minion } from '@overlay/shared';

export function tripleScore(shopCard: Minion, boardMinions: Minion[]): number {
  const copies = boardMinions.filter((m) => m.cardId === shopCard.cardId).length;
  // 2 copies on board + 1 from shop = triple
  if (copies >= 2) return 1.0;
  // 1 copy on board = halfway there
  if (copies === 1) return 0.4;
  return 0;
}
