import type { HsEvent } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';
import { applyEntityEvent } from '../entityRegistry';

export function applyShopSell(state: GameState, event: HsEvent): GameState {
  if (event.kind !== 'TAG_CHANGE') return state;
  if (event.tag !== 'ZONE') return state;
  if (event.value !== 'HAND') return state;

  const entityMatch = event.entity.match(/^(\d+)$/);
  if (!entityMatch || !entityMatch[1]) return state;

  const entityId = Number.parseInt(entityMatch[1], 10);

  // Update the entity registry to get the latest info for this entity
  const nextRegistry = applyEntityEvent(new Map(state.player.entityRegistry), event);
  const info = nextRegistry.get(entityId);

  // Only process if the entity belongs to the player
  if (!info || info.controller !== state.player.playerId) return state;

  // Find the minion on the board
  const boardMinions = state.player.board.minions;
  const minionIndex = boardMinions.findIndex((m) => m.entityId === entityId);
  if (minionIndex === -1) return state;

  // Remove from board
  const newBoardMinions = [...boardMinions];
  newBoardMinions.splice(minionIndex, 1);

  return {
    ...state,
    player: {
      ...state.player,
      entityRegistry: nextRegistry,
      board: {
        ...state.player.board,
        minions: newBoardMinions,
      },
    },
  };
}
