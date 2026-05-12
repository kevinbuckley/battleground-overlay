import type { TagChange } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';

export function applyGoldenMinion(state: GameState, event: TagChange): GameState {
  if (event.tag !== 'PREMIUM') return state;
  if (event.value !== '1') return state;

  const entityId = Number.parseInt(event.entity, 10);
  if (Number.isNaN(entityId)) return state;

  // Check player board
  const playerBoardIdx = state.player.board.minions.findIndex((m) => m.entityId === entityId);
  if (playerBoardIdx !== -1) {
    const newMinions = state.player.board.minions.map((m, i) =>
      i === playerBoardIdx ? { ...m, golden: true } : m,
    );
    return {
      ...state,
      player: {
        ...state.player,
        board: {
          ...state.player.board,
          minions: newMinions,
        },
      },
    };
  }

  // Check shop
  const shopIdx = state.player.shop.minions.findIndex((m) => m.entityId === entityId);
  if (shopIdx !== -1) {
    const newMinions = state.player.shop.minions.map((m, i) =>
      i === shopIdx ? { ...m, golden: true } : m,
    );
    return {
      ...state,
      player: {
        ...state.player,
        shop: {
          ...state.player.shop,
          minions: newMinions,
        },
      },
    };
  }

  // Check opponent boards
  const newOpponents = state.opponents.map((opp) => {
    const oppBoardIdx = opp.board.minions.findIndex((m) => m.entityId === entityId);
    if (oppBoardIdx !== -1) {
      const newMinions = opp.board.minions.map((m, i) =>
        i === oppBoardIdx ? { ...m, golden: true } : m,
      );
      return {
        ...opp,
        board: {
          ...opp.board,
          minions: newMinions,
        },
      };
    }
    return opp;
  });

  if (newOpponents === state.opponents) return state;
  return { ...state, opponents: newOpponents };
}
