import type { HsEvent } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';
import { applyEntityEvent } from '../entityRegistry';

export function applyMinionPlaced(state: GameState, event: HsEvent): GameState {
  if (event.kind !== 'TAG_CHANGE') return state;

  // Always keep the entity registry in sync for this entity
  const entityMatch = event.entity.match(/^(\d+)$/);
  if (!entityMatch || !entityMatch[1]) return state;

  const entityId = Number.parseInt(entityMatch[1], 10);
  const nextRegistry = applyEntityEvent(new Map(state.player.entityRegistry), event);
  const info = nextRegistry.get(entityId);
  if (!info) return state;

  // If this is a ZONE change to PLAY and the entity belongs to the player,
  // add a stub minion to the board.
  if (event.tag === 'ZONE' && event.value === 'PLAY') {
    // Only add if the entity's controller is explicitly the player's.
    // Controller 0 is the default from FULL_ENTITY and means "unknown" —
    // we wait for a TAG_CHANGE tag=CONTROLLER to resolve ownership.
    if (info.controller !== state.player.playerId) return state;

    // Check if already on board
    const existing = state.player.board.minions.find((m) => m.entityId === entityId);
    if (existing) return state;

    return {
      ...state,
      player: {
        ...state.player,
        entityRegistry: nextRegistry,
        board: {
          ...state.player.board,
          minions: [
            ...state.player.board.minions,
            {
              entityId,
              cardId: info.cardId,
              attack: 0,
              health: 0,
              taunt: false,
              divineShield: false,
              poisonous: false,
              reborn: false,
              frozen: false,
              tribes: [],
            },
          ],
        },
      },
    };
  }

  // For non-ZONE tag changes (CONTROLLER, CARDID), just update the registry
  return {
    ...state,
    player: {
      ...state.player,
      entityRegistry: nextRegistry,
    },
  };
}
