import type { HsEvent } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';
import { extractEntityId } from '../entityId';
import { applyEntityEvent } from '../entityRegistry';

export function applyMinionRemoved(state: GameState, event: HsEvent): GameState {
  if (event.kind !== 'TAG_CHANGE') return state;

  const entityId = extractEntityId(event.entity);
  if (entityId === null) return state;

  if (event.tag !== 'ZONE') return state;
  if (event.value !== 'GRAVEYARD' && event.value !== 'REMOVEDFROMGAME') {
    return state;
  }
  // BG combat temporarily moves minions through graveyard/removed zones and
  // restores survivors later. Honor removals outside combat only.
  if (state.phase === 'combat') return state;

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
