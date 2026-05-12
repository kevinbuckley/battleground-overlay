import type { HsEvent } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';
import { applyEntityEvent } from '../entityRegistry';

export function applyMinionRemoved(state: GameState, event: HsEvent): GameState {
  if (event.kind !== 'TAG_CHANGE') return state;

  const entityMatch = event.entity.match(/^(\d+)$/);
  if (!entityMatch || !entityMatch[1]) return state;

  const entityId = Number.parseInt(entityMatch[1], 10);

  // Only care about ZONE transitions to GRAVEYARD or REMOVEDFROMGAME
  if (event.tag !== 'ZONE') return state;
  if (event.value !== 'GRAVEYARD' && event.value !== 'REMOVEDFROMGAME') {
    return state;
  }

  // Update the entity registry to get the latest info for this entity
  const nextRegistry = applyEntityEvent(new Map(state.player.entityRegistry), event);
  const info = nextRegistry.get(entityId);

  // Only remove if the entity belongs to the player
  if (info && info.controller !== state.player.playerId) return state;

  // Remove from player's board
  const boardMinions = state.player.board.minions;
  const idx = boardMinions.findIndex((m) => m.entityId === entityId);
  if (idx === -1) return state; // not on board, nothing to do

  const nextMinions = boardMinions.filter((m) => m.entityId !== entityId);

  return {
    ...state,
    player: {
      ...state.player,
      entityRegistry: nextRegistry,
      board: {
        ...state.player.board,
        minions: nextMinions,
      },
    },
  };
}
