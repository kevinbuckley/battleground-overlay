import type { Recommendation } from '@overlay/shared';

export interface OverlayBridge {
  onRecs(cb: (r: unknown[]) => void): void;
  onExplanation(cb: (t: string) => void): void;
}

export function getActionText(rec: Recommendation): string {
  const action = rec.action;
  switch (action.type) {
    case 'Buy':
      return `Buy ${action.cardId}`;
    case 'Sell':
      return `Sell #${action.boardIndex}`;
    case 'Freeze':
      return 'Freeze shop';
    case 'Reroll':
      return 'Reroll shop';
    case 'TierUp':
      return 'Tier up';
    case 'Reposition':
      return `Reposition #${action.fromIndex} → #${action.toIndex}`;
    default:
      return '—';
  }
}

export function initRenderer(bridge: OverlayBridge): void {
  bridge.onRecs((recs: unknown[]) => {
    const list = recs as Recommendation[];
    const actionEl = document.getElementById('advice-action');
    const reasonEl = document.getElementById('advice-reason');
    if (!actionEl || !reasonEl) return;
    if (list.length > 0) {
      const top = list[0] as Recommendation;
      actionEl.textContent = getActionText(top);
      reasonEl.textContent = top.reason || '';
    } else {
      actionEl.textContent = '—';
      reasonEl.textContent = '';
    }
  });

  bridge.onExplanation((text: string) => {
    const el = document.getElementById('explanation');
    if (!el) return;
    if (text) {
      el.textContent = text;
      el.classList.add('visible');
    } else {
      el.textContent = '';
      el.classList.remove('visible');
    }
  });
}
