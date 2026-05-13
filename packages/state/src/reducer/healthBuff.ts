import type { TagChange } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';

export function applyHealthBuff(state: GameState, event: TagChange): GameState {
  if (event.tag !== 'HEALTH') return state;

  const entityId = Number.parseInt(event.entity, 10);
  if (Number.isNaN(entityId)) return state;

  const newHealth = Number.parseInt(event.value, 10);
  if (Number.isNaN(newHealth)) return state;

  // Skip player hero — that's handled by applyHeroHealth
  if (entityId === state.player.hero.entityId) return state;

  // Check player's board minions
  const playerMinion = state.player.board.minions.find((m) => m.entityId === entityId);
  if (playerMinion) {
    return {
      ...state,
      player: {
        ...state.player,
        board: {
          ...state.player.board,
          minions: state.player.board.minions.map((m) =>
            m.entityId === entityId ? { ...m, health: newHealth } : m,
          ),
        },
      },
    };
  }

  // Check opponents' boards
  const updatedOpponents = state.opponents.map((o) => {
    const oppMinion = o.board.minions.find((m) => m.entityId === entityId);
    if (!oppMinion) return o;
    return {
      ...o,
      board: {
        ...o.board,
        minions: o.board.minions.map((m) =>
          m.entityId === entityId ? { ...m, health: newHealth } : m,
        ),
      },
    };
  });

  return { ...state, opponents: updatedOpponents };
}
