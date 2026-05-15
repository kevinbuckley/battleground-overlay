import type { TagChange } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';

/**
 * Handles `TAG_CHANGE tag=GAME_TURN` on the player controller.
 * Sets `state.player.gameTurn: number` — the current game turn number.
 */
export function applyGameTurn(state: GameState, event: TagChange): GameState {
  if (event.tag !== 'GAME_TURN') return state;

  const entityId = Number.parseInt(event.entity, 10);
  if (Number.isNaN(entityId) || entityId !== state.player.entityId) return state;

  const value = Number.parseInt(event.value, 10);
  if (Number.isNaN(value)) return state;

  return {
    ...state,
    player: {
      ...state.player,
      gameTurn: value,
    },
  };
}
