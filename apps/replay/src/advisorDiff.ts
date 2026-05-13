import type { Recommendation } from '@overlay/shared';

export interface AdvisorDiff {
  turn: number;
  actual: Recommendation[];
  recommended: Recommendation[];
}

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

export function summarizeDiff(diffs: AdvisorDiff[]): string {
  const mismatchLines: string[] = [];

  for (const diff of diffs) {
    const actualSet = new Set(diff.actual.map((r) => formatAction(r)));
    const predictedSet = new Set(diff.recommended.map((r) => formatAction(r)));

    let hasMismatch = false;

    for (const r of diff.actual) {
      if (!predictedSet.has(formatAction(r))) {
        hasMismatch = true;
        break;
      }
    }

    if (!hasMismatch) {
      for (const r of diff.recommended) {
        if (!actualSet.has(formatAction(r))) {
          hasMismatch = true;
          break;
        }
      }
    }

    if (hasMismatch) {
      const actualAction = diff.actual[0] ? formatAction(diff.actual[0]) : 'nothing';
      const recommendedAction = diff.recommended[0] ? formatAction(diff.recommended[0]) : 'nothing';
      mismatchLines.push(
        `Turn ${diff.turn}: did ${actualAction}, advisor said ${recommendedAction}`,
      );
    }
  }

  if (mismatchLines.length === 0) {
    return 'No mismatches';
  }

  return mismatchLines.join('\n');
}
