import type { TagChange } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';

export function applyFrozenMinion(state: GameState, event: TagChange): GameState {
  if (event.tag !== 'FROZEN') return state;

  const entityId = Number.parseInt(event.entity, 10);
  if (Number.isNaN(entityId)) return state;

  const frozenValue = Number.parseInt(event.value, 10);
  if (Number.isNaN(frozenValue)) return state;

  const isFrozen = frozenValue === 1;

  const playerMinion = state.player.board.minions.find((m) => m.entityId === entityId);
  const oppMinion = state.opponents.flatMap((o) => o.board.minions).find((m) => m.entityId === entityId);
  if (!playerMinion && !oppMinion) return state;

  const playerBoard = state.player.board.minions.map((m) =>
    m.entityId === entityId ? { ...m, frozen: isFrozen } : m,
  );

  const updatedOpponents = state.opponents.map((opp) => {
    const oppBoard = opp.board.minions.map((m) =>
      m.entityId === entityId ? { ...m, frozen: isFrozen } : m,
    );
    return { ...opp, board: { ...opp.board, minions: oppBoard } };
  });

  return {
    ...state,
    player: { ...state.player, board: { ...state.player.board, minions: playerBoard } },
    opponents: updatedOpponents,
  };
}
