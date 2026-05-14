import type { GameState, Recommendation } from '@overlay/shared';

export function exportReport(turns: { state: GameState; recs: Recommendation[] }[]): string {
  const lines: string[] = ['Battlegrounds Session Report'];

  for (const { state, recs } of turns) {
    lines.push(`## Turn ${state.turn}`);
    lines.push('');
    lines.push(`Phase: ${state.phase}`);
    lines.push(
      `Player: Tier ${state.player.tier}, HP ${state.player.hero.hp}, Gold ${state.player.gold}`,
    );

    if (state.player.board.minions.length > 0) {
      lines.push(`Board: ${state.player.board.minions.map((m) => m.cardId).join(', ')}`);
    } else {
      lines.push('Board: (empty)');
    }

    if (state.opponents.length > 0) {
      const alive = state.opponents.filter((o) => !o.eliminated);
      if (alive.length > 0) {
        lines.push(`Opponents: ${alive.map((o) => `Tier ${o.tier} (HP ${o.hero.hp})`).join(', ')}`);
      } else {
        lines.push('Opponents: (all eliminated)');
      }
    }

    if (recs.length > 0) {
      lines.push('Recommendations:');
      for (const rec of recs.slice(0, 3)) {
        const score = rec.score.toFixed(1);
        lines.push(`- ${rec.action.type} (score ${score})`);
      }
    }

    lines.push('');
  }

  return lines.join('\n');
}
