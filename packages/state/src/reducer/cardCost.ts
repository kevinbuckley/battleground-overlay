import type { TagChange } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';

export function applyCardCost(state: GameState, event: TagChange): GameState {
  const entityId = Number.parseInt(event.entity, 10);
  if (Number.isNaN(entityId)) return state;

  // Only process entities in PLAY or SHOP zones
  const playerMinion = state.player.board.minions.find((m) => m.entityId === entityId);
  const opponentMinion = state.opponents
    .flatMap((o) => o.board.minions)
    .find((m) => m.entityId === entityId);
  const shopMinion = state.player.shop.minions.find((m) => m.entityId === entityId);

  const inZone = !!playerMinion || !!opponentMinion || !!shopMinion;
  if (!inZone) return state;

  const newCost = Number.parseInt(event.value, 10);
  if (Number.isNaN(newCost)) return state;

  if (playerMinion) {
    return {
      ...state,
      player: {
        ...state.player,
        board: {
          ...state.player.board,
          minions: state.player.board.minions.map((m) =>
            m.entityId === entityId ? { ...m, cost: newCost } : m,
          ),
        },
      },
    };
  }

  if (opponentMinion) {
    const updatedOpponents = state.opponents.map((o) => {
      if (o.board.minions.some((m) => m.entityId === entityId)) {
        return {
          ...o,
          board: {
            ...o.board,
            minions: o.board.minions.map((m) =>
              m.entityId === entityId ? { ...m, cost: newCost } : m,
            ),
          },
        };
      }
      return o;
    });
    return { ...state, opponents: updatedOpponents };
  }

  if (shopMinion) {
    return {
      ...state,
      player: {
        ...state.player,
        shop: {
          ...state.player.shop,
          minions: state.player.shop.minions.map((m) =>
            m.entityId === entityId ? { ...m, cost: newCost } : m,
          ),
        },
      },
    };
  }

  return state;
}
