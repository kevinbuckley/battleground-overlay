import type { TagChange } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';
import { applyEntityEvent } from '../entityRegistry';

export function applyCardId(state: GameState, event: TagChange): GameState {
  if (event.tag !== 'CARDID') return state;

  const entityMatch = event.entity.match(/^(\d+)$/);
  if (!entityMatch || !entityMatch[1]) return state;

  const entityId = Number.parseInt(entityMatch[1], 10);

  // Update the entity registry with the new cardId
  const nextRegistry = applyEntityEvent(new Map(state.player.entityRegistry), event);

  // The TAG_CHANGE event.value carries the new cardId directly
  const newCardId = event.value;

  // Check player board
  const playerMinion = state.player.board.minions.find((m) => m.entityId === entityId);
  if (playerMinion) {
    return {
      ...state,
      player: {
        ...state.player,
        entityRegistry: nextRegistry,
        board: {
          ...state.player.board,
          minions: state.player.board.minions.map((m) =>
            m.entityId === entityId ? { ...m, cardId: newCardId } : m,
          ),
        },
      },
    };
  }

  // Check opponent boards
  const updatedOpponents = state.opponents.map((o) => {
    const oppMinion = o.board.minions.find((m) => m.entityId === entityId);
    if (oppMinion) {
      return {
        ...o,
        board: {
          ...o.board,
          minions: o.board.minions.map((m) =>
            m.entityId === entityId ? { ...m, cardId: newCardId } : m,
          ),
        },
      };
    }
    return o;
  });

  // If no opponent minion matched, this is no-op (e.g. hero entity)
  const anyOpponentMatched = updatedOpponents.some((o, i) => o !== state.opponents[i]);
  if (!anyOpponentMatched) return state;

  return { ...state, opponents: updatedOpponents };
}
