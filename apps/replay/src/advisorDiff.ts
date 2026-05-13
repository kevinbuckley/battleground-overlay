import type { Recommendation } from '@overlay/shared';

export interface AdvisorDiff {
  turn: number;
  actual: Recommendation[];
  recommended: Recommendation[];
}

export interface RecDiff {
  action: string;
  actualScore: number;
  expectedScore: number;
}

export function diffRecs(actual: Recommendation[], expected: Recommendation[]): RecDiff[] {
  const diffs: RecDiff[] = [];

  function actionKey(rec: Recommendation): string {
    switch (rec.action.type) {
      case 'Buy':
        return `Buy ${rec.action.cardId}`;
      case 'Sell':
        return `Sell [${rec.action.boardIndex}]`;
      case 'Freeze':
        return 'Freeze';
      case 'Reroll':
        return 'Reroll';
      case 'TierUp':
        return 'TierUp';
      case 'Reposition':
        return `Reposition [${rec.action.fromIndex}→${rec.action.toIndex}]`;
    }
  }

  const actualMap = new Map<string, Recommendation>();
  for (const r of actual) {
    const key = actionKey(r);
    actualMap.set(key, r);
  }

  const expectedMap = new Map<string, Recommendation>();
  for (const r of expected) {
    const key = actionKey(r);
    expectedMap.set(key, r);
  }

  const allKeys = new Set([...actualMap.keys(), ...expectedMap.keys()]);

  for (const key of allKeys) {
    const a = actualMap.get(key);
    const e = expectedMap.get(key);
    if (a && e) {
      if (a.score !== e.score) {
        diffs.push({
          action: formatAction(a),
          actualScore: a.score,
          expectedScore: e.score,
        });
      }
    } else if (a) {
      diffs.push({
        action: formatAction(a),
        actualScore: a.score,
        expectedScore: 0,
      });
    } else if (e) {
      diffs.push({
        action: formatAction(e),
        actualScore: 0,
        expectedScore: e.score,
      });
    }
  }

  return diffs;
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
