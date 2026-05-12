import type { Recommendation } from '@overlay/shared';

export function formatAction(rec: Recommendation): string {
  const score = rec.score.toFixed(1);
  switch (rec.action.type) {
    case 'Buy':
      return `Buy ${rec.action.cardId} (score ${score})`;
    case 'Sell':
      return `Sell [${rec.action.boardIndex}] (score ${score})`;
    case 'Freeze':
      return `Freeze (score ${score})`;
    case 'Reroll':
      return `Reroll (score ${score})`;
    case 'TierUp':
      return `TierUp (score ${score})`;
    case 'Reposition':
      return `Reposition [${rec.action.fromIndex}→${rec.action.toIndex}] (score ${score})`;
  }
}

export function advisorDiff(actual: Recommendation[], predicted: Recommendation[]): string {
  const lines: string[] = [];

  const actualSet = new Set(actual.map((r) => formatAction(r)));
  const predictedSet = new Set(predicted.map((r) => formatAction(r)));

  for (const rec of actual) {
    const label = formatAction(rec);
    if (!predictedSet.has(label)) {
      lines.push(`- ${label}`);
    }
  }

  for (const rec of predicted) {
    const label = formatAction(rec);
    if (!actualSet.has(label)) {
      lines.push(`+ ${label}`);
    }
  }

  return lines.join('\n');
}
