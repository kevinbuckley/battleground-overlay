import type { GameState } from '@overlay/shared';

export function formatState(state: GameState): string {
  const lines: string[] = [];
  lines.push(`turn: ${state.turn}`);
  lines.push(`phase: ${state.phase}`);
  lines.push(`player hp: ${state.player.hero.hp}`);
  lines.push(`player tier: ${state.player.tier}`);
  lines.push(`player gold: ${state.player.gold}`);
  lines.push(`board minions: ${state.player.board.minions.length}`);
  lines.push(`opponents: ${state.opponents.length}`);
  for (const opp of state.opponents) {
    lines.push(
      `  opp[${opp.playerId}] hp:${opp.hero.hp} tier:${opp.tier} elim:${opp.eliminated} board:${opp.board.minions.length}`,
    );
  }
  return lines.join('\n');
}
