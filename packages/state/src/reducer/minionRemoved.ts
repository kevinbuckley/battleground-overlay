import type { HsEvent } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';
import { extractEntityId } from '../entityId';
import { applyEntityEvent } from '../entityRegistry';

export function applyMinionRemoved(state: GameState, event: HsEvent): GameState {
  if (event.kind !== 'TAG_CHANGE') return state;

  const entityId = extractEntityId(event.entity);
  if (entityId === null) return state;

  // BG uses GRAVEYARD/REMOVEDFROMGAME during combat resolution to temporarily
  // shuffle minions, then restores survivors back to PLAY. If we react to
  // either transition we lose the persistent board between turns. Instead we
  // only remove on explicit PLAY → HAND (the player sold the minion), which
  // is handled by applyShopSell. This reducer is now a no-op for BG.
  return state;
  if (event.tag !== 'ZONE') return state;
  if (event.value !== 'GRAVEYARD') {
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
