import type { Card } from './types';

export interface PatchDiff {
  added: Card[];
  removed: Card[];
  statChanges: { id: string; oldStat: string; newStat: string }[];
}

export function patchDiff(oldCards: Card[], newCards: Card[]): PatchDiff {
  const oldByDbf = new Map<number, Card>();
  const newByDbf = new Map<number, Card>();

  for (const c of oldCards) oldByDbf.set(c.dbfId, c);
  for (const c of newCards) newByDbf.set(c.dbfId, c);

  const added: Card[] = [];
  const removed: Card[] = [];
  const statChanges: { id: string; oldStat: string; newStat: string }[] = [];

  for (const [dbfId, newCard] of newByDbf) {
    const oldCard = oldByDbf.get(dbfId);
    if (!oldCard) {
      added.push(newCard);
      continue;
    }
    const oldStat = statsString(oldCard);
    const newStat = statsString(newCard);
    if (oldStat !== newStat) {
      statChanges.push({ id: newCard.id, oldStat, newStat });
    }
  }

  for (const [dbfId, oldCard] of oldByDbf) {
    if (!newByDbf.has(dbfId)) {
      removed.push(oldCard);
    }
  }

  return { added, removed, statChanges };
}

function statsString(card: Card): string {
  return `${card.cost}|${card.attack ?? ''}|${card.health ?? ''}`;
}
