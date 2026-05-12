import type { HsEvent } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';
import { applyArmor } from './reducer/armor';
import { applyCombatDamage } from './reducer/combatDamage';
import { applyDeathrattle } from './reducer/deathrattle';
import { applyGold } from './reducer/gold';
import { applyGoldenMinion } from './reducer/goldenMinion';
import { applyHandTracker } from './reducer/handTracker';
import { applyHeroHealth } from './reducer/health';
import { applyHeroIdentify } from './reducer/heroIdentify';
import { applyHeroPower } from './reducer/heroPower';
import { applyLobbySize } from './reducer/lobbySize';
import { applyMinionPlaced } from './reducer/minionPlaced';
import { applyMinionRemoved } from './reducer/minionRemoved';
import { applyOpponentHealth } from './reducer/opponentHealth';
import { applyOpponentTier } from './reducer/opponentTier';
import { applyPlayerLost } from './reducer/playerLost';
import { applyShopBuy } from './reducer/shopBuy';
import { applyShopFreeze } from './reducer/shopFreeze';
import { applyShopRefresh } from './reducer/shopRefresh';
import { applyShopReroll } from './reducer/shopReroll';
import { applyShopSell } from './reducer/shopSell';
import { applyTierUp } from './reducer/tierUp';
import { applyTripleBonus } from './reducer/tripleBonus';
import { applyTurnPhase } from './reducer/turnPhase';

export function reducer(state: GameState, event: HsEvent): GameState {
  switch (event.kind) {
    case 'BLOCK_START':
      if (event.blockType === 'TRIGGER' && event.effectCardId === 'TB_BaconShop_StartGame') {
        return { ...state, turn: 1, phase: 'shopping' };
      }
      return applyDeathrattle(state, event);

    case 'FULL_ENTITY':
      return applyMinionPlaced(state, event);

    case 'SHOW_ENTITY':
      return applyHeroIdentify(state, event);

    case 'ZONE_CHANGE_LIST':
      return applyShopRefresh(state, event);

    case 'TAG_CHANGE':
      if (event.tag === 'PLAYSTATE' && event.value === 'LOST') {
        return applyPlayerLost(state, event);
      }
      if (event.tag === 'HEALTH') {
        return applyHeroHealth(state, event);
      }
      if (event.tag === 'ARMOR') {
        return applyArmor(state, event);
      }
      if (event.tag === 'RESOURCES') {
        return applyGold(state, event);
      }
      if (event.tag === 'PLAYER_TECH_LEVEL') {
        return applyTierUp(state, event);
      }
      // Check if this is an opponent health change
      {
        const entityId = Number.parseInt(event.entity, 10);
        if (!Number.isNaN(entityId) && state.opponents.some((o) => o.entityId === entityId)) {
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
        const afterShopBuy = applyShopBuy(state, event);
        if (afterShopBuy === state) {
          return applyMinionPlaced(state, event);
        }
        return afterShopBuy;
      }
      if (event.tag === 'ZONE' && event.value === 'HAND') {
        // Check if this entity is in the hand (not a shop buy)
        const entityId = Number.parseInt(event.entity, 10);
        if (state.player.hand.includes(entityId)) {
          return applyHandTracker(state, event);
        }
        return applyShopSell(state, event);
      }
      if (event.tag === 'STEP') {
        return applyTurnPhase(state, event);
      }
      if (event.tag === 'DAMAGE') {
        return applyCombatDamage(state, event);
      }
      if (event.tag === 'FROZEN') {
        return applyShopFreeze(state, event);
      }
      if (event.tag === 'RESOURCES_USED') {
        return applyShopReroll(state, event);
      }
      if (event.tag === 'PREMIUM') {
        return applyGoldenMinion(state, event);
      }
      if (event.tag === 'NUM_TIMES_HERO_POWER_USED_THIS_GAME') {
        return applyHeroPower(state, event);
      }
      if (event.tag === 'NUM_MINIONS_IN_LOBBY') {
        return applyLobbySize(state, event);
      }
      if (event.tag === 'CONTROLLER') {
        return applyMinionPlaced(state, event);
      }
      return applyTripleBonus(state, event);

    default:
      return state;
  }
}
