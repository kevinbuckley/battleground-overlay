import type { HsEvent } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';
import { applyGold } from './reducer/gold';
import { applyHeroHealth } from './reducer/health';
import { applyMinionPlaced } from './reducer/minionPlaced';
import { applyMinionRemoved } from './reducer/minionRemoved';
import { applyOpponentHealth } from './reducer/opponentHealth';
import { applyOpponentTier } from './reducer/opponentTier';
import { applyPlayerLost } from './reducer/playerLost';
import { applyShopBuy } from './reducer/shopBuy';
import { applyShopRefresh } from './reducer/shopRefresh';
import { applyTier } from './reducer/tier';

export function reducer(state: GameState, event: HsEvent): GameState {
  switch (event.kind) {
    case 'BLOCK_START':
      if (event.blockType === 'TRIGGER' && event.effectCardId === 'TB_BaconShop_StartGame') {
        return { ...state, turn: 1, phase: 'shopping' };
      }
      return state;

    case 'ZONE_CHANGE_LIST':
      return applyShopRefresh(state, event);

    case 'TAG_CHANGE':
      if (event.tag === 'PLAYSTATE' && event.value === 'LOST') {
        return applyPlayerLost(state, event);
      }
      if (event.tag === 'HEALTH') {
        return applyHeroHealth(state, event);
      }
      if (event.tag === 'RESOURCES') {
        return applyGold(state, event);
      }
      if (event.tag === 'PLAYER_TECH_LEVEL') {
        return applyTier(state, event);
      }
      // Check if this is an opponent health change
      {
        const entityId = Number.parseInt(event.entity, 10);
        if (!isNaN(entityId) && state.opponents.some((o) => o.entityId === entityId)) {
          if (event.tag === 'PLAYER_TECH_LEVEL') {
            return applyOpponentTier(state, event);
          }
          return applyOpponentHealth(state, event);
        }
      }
      if (
        event.tag === 'ZONE' &&
        (event.value === 'GRAVEYARD' || event.value === 'REMOVEDFROMGAME')
      ) {
        return applyMinionRemoved(state, event);
      }
      if (event.tag === 'ZONE' && event.value === 'PLAY') {
        return applyShopBuy(state, event);
      }
      return applyMinionPlaced(state, event);

    default:
      return state;
  }
}
