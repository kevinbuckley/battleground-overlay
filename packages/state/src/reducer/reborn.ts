import type { BlockStart, HsEvent } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';

function isRebornBlock(event: BlockStart): boolean {
  return event.blockType === 'TRIGGER' && event.triggerKeyword.includes('Reborn');
}

export function applyReborn(state: GameState, event: HsEvent): GameState {
  if (event.kind !== 'BLOCK_START') return state;
  if (!isRebornBlock(event as BlockStart)) return state;

  const newEntityId = Number.parseInt(event.entity, 10);
  if (Number.isNaN(newEntityId)) return state;

  const registry = state.player.entityRegistry;
  const regEntry = registry.get(newEntityId);

  // Only care about player's own entities
  if (!regEntry || regEntry.controller !== state.player.playerId) {
    return state;
  }

  // Only care about entities entering PLAY zone
  if (regEntry.zone !== 'PLAY') {
    return state;
  }

  // Find the minion on the player's board matching this entityId
  const minionIndex = state.player.board.minions.findIndex((m) => m.entityId === newEntityId);
  if (minionIndex === -1) {
    return state;
  }

  const nextMinions = state.player.board.minions.map((m, i) =>
    i === minionIndex ? { ...m, reborn: true } : m,
  );

  return {
    ...state,
    player: {
      ...state.player,
      board: {
        ...state.player.board,
        minions: nextMinions,
      },
    },
  };
}
