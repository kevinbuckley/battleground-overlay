import type { HsEvent } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';
import { applyAnomaly } from './reducer/anomaly';
import { applyArmor } from './reducer/armor';
import { applyBuffs } from './reducer/buffs';
import { applyCardCost } from './reducer/cardCost';
import { applyCardsGiven } from './reducer/cardsGiven';
import { applyCardsInDeck } from './reducer/cardsInDeck';
import { applyCardsPlayed } from './reducer/cardsPlayed';
import { applyCleave } from './reducer/cleave';
import { applyCombatDamage } from './reducer/combatDamage';
import { applyDeathrattle } from './reducer/deathrattle';
import { applyDivineShield } from './reducer/divineShield';
import { applyElite } from './reducer/elite';
import { applyFrozenMinion } from './reducer/frozenMinion';
import { applyGameOver } from './reducer/gameOver';
import { applyGold } from './reducer/gold';
import { applyGoldenMinion } from './reducer/goldenMinion';
import { applyHandSize } from './reducer/handSize';
import { applyHandTracker } from './reducer/handTracker';
import { applyHeroHealth } from './reducer/health';
import { applyHeroIdentify } from './reducer/heroIdentify';
import { applyHeroPower } from './reducer/heroPower';
import { applyHeroPowerCardId } from './reducer/heroPowerCardId';
import { applyLobbySize } from './reducer/lobbySize';
import { applyMinionPlaced } from './reducer/minionPlaced';
import { applyMinionRemoved } from './reducer/minionRemoved';
import { applyMinionsOnBoard } from './reducer/minionsOnBoard';
import { applyOpponentEliminated } from './reducer/opponentEliminated';
import { applyOpponentHealth } from './reducer/opponentHealth';
import { applyOpponentTier } from './reducer/opponentTier';
import { applyPlayerDeath } from './reducer/playerDeath';
import { applyPlayerLost } from './reducer/playerLost';
import { applyPoisonous } from './reducer/poisonous';
import { applyReborn } from './reducer/reborn';
import { applyShopBuy } from './reducer/shopBuy';
import { applyShopFreeze } from './reducer/shopFreeze';
import { applyShopRefresh } from './reducer/shopRefresh';
import { applyShopReroll } from './reducer/shopReroll';
import { applyShopSell } from './reducer/shopSell';
import { applySilence } from './reducer/silence';
import { applyTaunt } from './reducer/taunt';
import { applyTierUp } from './reducer/tierUp';
import { applyTrinket } from './reducer/trinket';
import { applyTripleBonus } from './reducer/tripleBonus';
import { applyTurnPhase } from './reducer/turnPhase';
import { applyTurnsInGame } from './reducer/turnsInGame';
import { applyWindfury } from './reducer/windfury';

export function reducer(state: GameState, event: HsEvent): GameState {
  switch (event.kind) {
    case 'BLOCK_START': {
      if (event.blockType === 'TRIGGER' && event.effectCardId === 'TB_BaconShop_StartGame') {
        return { ...state, turn: 1, phase: 'shopping' };
      }
      const afterDeathrattle = applyDeathrattle(state, event);
      if (afterDeathrattle !== state) {
        return applyReborn(afterDeathrattle, event);
      }
      return afterDeathrattle;
    }

    case 'FULL_ENTITY':
      return applyMinionPlaced(state, event);

    case 'SHOW_ENTITY':
      return applyHeroIdentify(state, event);

    case 'ZONE_CHANGE_LIST':
      return applyShopRefresh(state, event);

    case 'TAG_CHANGE':
      if (event.tag === 'PLAYSTATE' && event.value === 'FINISHED') {
        return applyGameOver(state, event);
      }
      if (event.tag === 'PLAYSTATE' && event.value === 'LOST') {
        return applyPlayerLost(state, event);
      }
      if (event.tag === 'HEALTH') {
        if (event.value === '0' && event.entity === String(state.player.entityId)) {
          return applyPlayerDeath(state, event);
        }
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
          if (event.tag === 'HEALTH' && event.value === '0') {
            return applyOpponentEliminated(state, event);
          }
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
        const afterShopFreeze = applyShopFreeze(state, event);
        if (afterShopFreeze !== state) {
          return afterShopFreeze;
        }
        return applyFrozenMinion(state, event);
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
      if (event.tag === 'HERO_POWER_ID') {
        return applyHeroPowerCardId(state, event);
      }
      if (event.tag === 'NUM_MINIONS_IN_LOBBY') {
        return applyLobbySize(state, event);
      }
      if (event.tag === 'CONTROLLER') {
        return applyMinionPlaced(state, event);
      }
      if (event.tag === 'ANOMALY') {
        return applyAnomaly(state, event);
      }
      if (event.tag === 'ATK') {
        return applyBuffs(state, event);
      }
      if (event.tag === 'DIVINE_SHIELD') {
        return applyDivineShield(state, event);
      }
      if (event.tag === 'SILENCED') {
        return applySilence(state, event);
      }
      if (event.tag === 'TAUNT') {
        return applyTaunt(state, event);
      }
      if (event.tag === 'POISONOUS') {
        return applyPoisonous(state, event);
      }
      if (event.tag === 'WINDFURY') {
        return applyWindfury(state, event);
      }
      if (event.tag === 'CLEAVE') {
        return applyCleave(state, event);
      }
      if (event.tag === 'ELITE') {
        return applyElite(state, event);
      }
      if (event.tag === 'NUM_CARDS_IN_HAND') {
        return applyHandSize(state, event);
      }
      if (event.tag === 'TRINKET') {
        return applyTrinket(state, event);
      }
      if (event.tag === 'COST') {
        return applyCardCost(state, event);
      }
      if (event.tag === 'NUM_CARDS_IN_DECK') {
        return applyCardsInDeck(state, event);
      }
      if (event.tag === 'NUM_CARDS_PLAYED_THIS_TURN') {
        return applyCardsPlayed(state, event);
      }
      if (event.tag === 'NUM_CARDS_GIVEN_THIS_TURN') {
        return applyCardsGiven(state, event);
      }
      if (event.tag === 'NUM_TURNS_IN_GAME') {
        return applyTurnsInGame(state, event);
      }
      if (event.tag === 'NUM_MINIONS_ON_BOARD') {
        return applyMinionsOnBoard(state, event);
      }
      return applyTripleBonus(state, event);

    default:
      return state;
  }
}
