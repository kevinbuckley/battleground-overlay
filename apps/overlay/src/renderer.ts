import type { Recommendation } from '@overlay/shared';

export interface OverlayBridge {
  onRecs(cb: (r: unknown[]) => void): void;
  onExplanation(cb: (t: string) => void): void;
  onDamage(cb: (f: unknown) => void);
  onBoard(cb: (b: unknown) => void);
  onOpponents(cb: (o: unknown[]) => void);
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
    const listEl = document.getElementById('advice-list');
    if (!actionEl && !reasonEl && !listEl) return;
    if (list.length > 0) {
      const top = list[0] as Recommendation;
      actionEl.textContent = getActionText(top);
      reasonEl.textContent = top.reason || '';
    } else {
      actionEl.textContent = '—';
      reasonEl.textContent = '';
    }
    if (listEl) {
      const capped = list.slice(0, 3);
      const items = capped.map((r) => `<li>${getActionText(r as Recommendation)}</li>`).join('');
      listEl.innerHTML = items;
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

  bridge.onDamage((forecast: unknown) => {
    const el = document.getElementById('damage-forecast');
    if (!el) return;
    const f = forecast as { winPct: number; minDmg?: number; maxDmg?: number };
    const pct = Math.round(f.winPct * 100);
    const minDmg = f.minDmg ?? 0;
    const maxDmg = f.maxDmg ?? 0;
    el.textContent = `Win: ${pct}% (${minDmg}-${maxDmg} dmg)`;
  });

  bridge.onBoard((boardData: unknown) => {
    const countEl = document.getElementById('board-count');
    const bestEl = document.getElementById('board-best-attack');
    if (!countEl && !bestEl) return;
    const b = boardData as { minions: { attack: number; health: number; cardId: string }[] };
    if (countEl) {
      countEl.textContent = `Minions: ${b.minions.length}`;
    }
    if (bestEl && b.minions.length > 0) {
      let best = b.minions[0]!;
      for (let i = 1; i < b.minions.length; i++) {
        if (b.minions[i].attack > best.attack) best = b.minions[i];
      }
      bestEl.textContent = `Best: ${best.attack}/${best.health}`;
    } else if (bestEl) {
      bestEl.textContent = '';
    }
  });

  bridge.onOpponents((opponentsData: unknown) => {
    const countEl = document.getElementById('opponent-count');
    const aliveEl = document.getElementById('opponent-alive');
    if (!countEl && !aliveEl) return;
    const o = opponentsData as { eliminated: boolean }[];
    if (countEl) {
      countEl.textContent = `Opponents: ${o.length}`;
    }
    if (aliveEl) {
      const alive = o.filter((opp) => !opp.eliminated).length;
      aliveEl.textContent = `Alive: ${alive}/${o.length}`;
    }
  });
}
