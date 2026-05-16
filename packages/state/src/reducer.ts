import type { HsEvent } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';
import { applyEntityEvent } from './entityRegistry';
import { initialOpponentState } from './initialState';
import { applyAnomaly } from './reducer/anomaly';
import { applyArmor } from './reducer/armor';
import { applyAttackBuff } from './reducer/attackBuff';

import { applyBountyCards } from './reducer/bountyCards';
import { applyCardCost } from './reducer/cardCost';
import { applyCardId } from './reducer/cardId';
import { applyCardsDrawn } from './reducer/cardsDrawn';
import { applyCardsGiven } from './reducer/cardsGiven';
import { applyCardsInDeck } from './reducer/cardsInDeck';
import { applyCardsPlayed } from './reducer/cardsPlayed';
import { applyCharge } from './reducer/charge';
import { applyCleave } from './reducer/cleave';
import { applyCombatDamage } from './reducer/combatDamage';
import { applyCombo } from './reducer/combo';
import { applyDeathrattle } from './reducer/deathrattle';
import { applyDeathrattlesTriggered } from './reducer/deathrattlesTriggered';
import { applyDiscover } from './reducer/discover';
import { applyDivineShield } from './reducer/divineShield';
import { applyElite } from './reducer/elite';
import { applyExhausted } from './reducer/exhausted';
import { applyFatigue } from './reducer/fatigue';
import { applyFrozenMinion } from './reducer/frozenMinion';
import { applyGameOver } from './reducer/gameOver';
import { applyGameTurn } from './reducer/gameTurn';
import { applyGameType } from './reducer/gameType';
import { applyGold } from './reducer/gold';
import { applyGoldSpent } from './reducer/goldSpent';
import { applyGoldenMinion } from './reducer/goldenMinion';
import { applyHandSize } from './reducer/handSize';
import { applyHandTracker } from './reducer/handTracker';
import { applyHeroHealth } from './reducer/health';
import { applyHealthBuff } from './reducer/healthBuff';
import { applyHeroIdentify } from './reducer/heroIdentify';
import { applyHeroPower } from './reducer/heroPower';
import { applyHeroPowerCardId } from './reducer/heroPowerCardId';
import { applyHeroPowerCost } from './reducer/heroPowerCost';
import { applyImmune } from './reducer/immune';
import { applyLifesteal } from './reducer/lifesteal';
import { applyLobbySize } from './reducer/lobbySize';
import { applyMagnetic } from './reducer/magnetic';
import { applyMinionPlaced } from './reducer/minionPlaced';
import { applyMinionRemoved } from './reducer/minionRemoved';
import { applyMinionsDied } from './reducer/minionsDied';
import { applyMinionsKilled } from './reducer/minionsKilled';
import { applyMinionsOnBoard } from './reducer/minionsOnBoard';
import { applyNumChoices } from './reducer/numChoices';
import { applyNumGameTurns } from './reducer/numGameTurns';
import { applyNumMinionsTraded } from './reducer/numMinionsTraded';
import { applyOpponentEliminated } from './reducer/opponentEliminated';
import { applyOpponentHealth } from './reducer/opponentHealth';
import { applyOpponentRevives } from './reducer/opponentRevives';
import { applyOpponentTier } from './reducer/opponentTier';
import { applyOpponentTurnsInGame } from './reducer/opponentTurnsInGame';
import { applyOpponentTurnsPlayed } from './reducer/opponentTurnsPlayed';
import { applyPlayerDeath } from './reducer/playerDeath';
import { applyPlayerLost } from './reducer/playerLost';
import { applyPlayerTurnsPlayed } from './reducer/playerTurnsPlayed';
import { applyPoisonous } from './reducer/poisonous';
import { applyRace } from './reducer/race';
import { applyReborn } from './reducer/reborn';
import { applyRevives } from './reducer/revives';
import { applyShopBuy } from './reducer/shopBuy';
import { applyShopFreeze } from './reducer/shopFreeze';
import { applyShopRefresh, applyShopRefreshFromZonePlay } from './reducer/shopRefresh';
import { applyShopReroll } from './reducer/shopReroll';
import { applyShopSell } from './reducer/shopSell';
import { applyShopSize } from './reducer/shopSize';
import { applySilence } from './reducer/silence';
import { applySpellPower } from './reducer/spellPower';
import { applyTaunt } from './reducer/taunt';
import { applyTierUp } from './reducer/tierUp';
import { applyTotalCardsDrawn } from './reducer/totalCardsDrawn';
import { applyTotalCardsPlayed } from './reducer/totalCardsPlayed';
import { applyTrinket } from './reducer/trinket';
import { applyTripleBonus } from './reducer/tripleBonus';
import { applyTurnPhase } from './reducer/turnPhase';
import { applyTurnTimer } from './reducer/turnTimer';
import { applyTurnsInGame } from './reducer/turnsInGame';
import { applyVictories } from './reducer/victories';
import { applyWindfury } from './reducer/windfury';

function createLobbyOpponentStubs(): GameState['opponents'] {
  return Array.from({ length: 7 }, () => initialOpponentState());
}

function resetMatchStateForPlayer(state: GameState, entityId: number, playerId: number): GameState {
  return {
    ...state,
    turn: 0,
    phase: 'lobby',
    opponents: createLobbyOpponentStubs(),
    player: {
      ...state.player,
      entityId,
      playerId,
      hero: { entityId, cardId: '', hp: 40, armor: 0 },
      board: { minions: [] },
      shop: { minions: [], frozen: false, rollCost: 1 },
      hand: [],
      gold: 0,
      tier: 1,
      tierUpCost: 6,
      eliminated: false,
      pendingTriple: null,
      heroPowerUsedThisTurn: false,
      handSize: 0,
      trinketUsed: false,
      cardsPlayedThisTurn: 0,
      cardsGivenThisTurn: 0,
      cardsDrawnThisTurn: 0,
      goldSpentThisTurn: 0,
      minionsOnBoard: 0,
      minionsKilledThisTurn: 0,
      minionsDiedThisTurn: 0,
      minionsTradedThisTurn: 0,
      turnsPlayed: 0,
      turnsInGame: 0,
      deathrattlesTriggeredThisTurn: 0,
      entityRegistry: new Map(),
    },
  };
}

function opponentFromPlayerInfo(entityId: number, playerId: number) {
  return {
    ...initialOpponentState(entityId, playerId),
    hero: { entityId, cardId: '', hp: 40, armor: 0 },
  };
}

export function reducer(inputState: GameState, event: HsEvent): GameState {
  let state = inputState;
  switch (event.kind) {
    case 'PLAYER_NAME': {
      // Attribute the name to the matching player (local or opponent).
      if (state.player.playerId === event.playerId) {
        return { ...state, player: { ...state.player, name: event.name } };
      }
      return state;
    }

    case 'PLAYER_INFO': {
      if (event.isLocal) {
        // Identify the human player so controller checks downstream succeed.
        // A different (entityId, playerId) means a new BG match — reset the
        // per-match state.
        const identityChanged =
          state.player.playerId !== event.playerId || state.player.entityId !== event.entityId;
        if (identityChanged) {
          return resetMatchStateForPlayer(state, event.entityId, event.playerId);
        }
        return state;
      }
      // Remote player → update a known slot, or claim the first lobby stub.
      const existingIndex = state.opponents.findIndex((o) => o.playerId === event.playerId);
      if (existingIndex !== -1) {
        const existing = state.opponents[existingIndex];
        if (existing?.entityId === event.entityId) return state;
        const opponents = state.opponents.map((o, i) =>
          i === existingIndex ? { ...o, entityId: event.entityId, playerId: event.playerId } : o,
        );
        return { ...state, opponents };
      }
      const stubIndex = state.opponents.findIndex((o) => o.playerId === 0 && o.entityId === 0);
      if (stubIndex !== -1) {
        const opponents = state.opponents.map((o, i) =>
          i === stubIndex ? opponentFromPlayerInfo(event.entityId, event.playerId) : o,
        );
        return { ...state, opponents };
      }
      if (state.opponents.length >= 7) return state;
      return {
        ...state,
        opponents: [...state.opponents, opponentFromPlayerInfo(event.entityId, event.playerId)],
      };
    }

    case 'BLOCK_START': {
      if (event.blockType === 'ATTACK' || event.blockType === 'DEATHS') {
        return { ...state, phase: 'combat' };
      }
      if (event.blockType === 'TRIGGER' && event.effectCardId === 'TB_BaconShop_StartGame') {
        // New BG match — reset board/shop/hand/opponents/registry. Keep the
        // resolved player identity so we don't have to rediscover it.
        return {
          ...state,
          turn: 1,
          phase: 'shopping',
          opponents: state.player.playerId === 0 ? state.opponents : createLobbyOpponentStubs(),
          player: {
            ...state.player,
            board: { minions: [] },
            shop: { minions: [], frozen: false, rollCost: 1 },
            hand: [],
            gold: 0,
            tier: 1,
            tierUpCost: 6,
            eliminated: false,
            pendingTriple: null,
            heroPowerUsedThisTurn: false,
            handSize: 0,
            trinketUsed: false,
            cardsPlayedThisTurn: 0,
            cardsGivenThisTurn: 0,
            cardsDrawnThisTurn: 0,
            goldSpentThisTurn: 0,
            minionsOnBoard: 0,
            minionsKilledThisTurn: 0,
            minionsDiedThisTurn: 0,
            minionsTradedThisTurn: 0,
            turnsPlayed: 0,
            turnsInGame: 0,
            deathrattlesTriggeredThisTurn: 0,
            entityRegistry: new Map(),
          },
        };
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

    case 'TAG_CHANGE': {
      // Keep the player's entity registry up to date for every TAG_CHANGE so
      // ATK/HEALTH/CARDID/CONTROLLER/ZONE info is available to subsequent
      // dispatches (e.g. minion-placement consults registry attack/health).
      const updatedRegistry = applyEntityEvent(new Map(state.player.entityRegistry), event);
      if (updatedRegistry !== state.player.entityRegistry) {
        state = { ...state, player: { ...state.player, entityRegistry: updatedRegistry } };
      }
      if (event.tag === 'ZONE' || event.tag === 'HAS_DRAG_TO_BUY') {
        const afterShopZone = applyShopRefreshFromZonePlay(state, event);
        if (afterShopZone !== state) {
          return afterShopZone;
        }
      }
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
          if (event.tag === 'NUM_TURNS_PLAYED') {
            return applyOpponentTurnsPlayed(state, event);
          }
          return applyOpponentHealth(state, event);
        }
      }
      // HEALTH on a minion entity (not a hero)
      if (event.tag === 'HEALTH') {
        const entityId = Number.parseInt(event.entity, 10);
        if (!Number.isNaN(entityId)) {
          const playerMinion = state.player.board.minions.find((m) => m.entityId === entityId);
          const opponentMinion = state.opponents.some((o) =>
            o.board.minions.some((m) => m.entityId === entityId),
          );
          if (playerMinion || opponentMinion) {
            return applyHealthBuff(state, event);
          }
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
      // The Game-level entity's NUM_TURNS_IN_PLAY counts BG turns 1, 2, 3, …
      // Anchor state.turn to it so we don't drift via STEP=MAIN_READY (which
      // fires multiple times per real BG turn).
      if (event.tag === 'NUM_TURNS_IN_PLAY' && event.entity === 'GameEntity') {
        const n = Number.parseInt(event.value, 10);
        if (!Number.isNaN(n) && n > state.turn) {
          return { ...state, turn: n };
        }
        return state;
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
        const afterGoldSpent = applyGoldSpent(state, event);
        if (afterGoldSpent !== state) {
          return afterGoldSpent;
        }
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
      if (event.tag === 'HERO_POWER_COST') {
        return applyHeroPowerCost(state, event);
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
        return applyAttackBuff(state, event);
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
      if (event.tag === 'LIFESTEAL') {
        return applyLifesteal(state, event);
      }
      if (event.tag === 'EXHAUSTED') {
        return applyExhausted(state, event);
      }
      if (event.tag === 'MAGNETIC') {
        return applyMagnetic(state, event);
      }
      if (event.tag === 'IMMUNE') {
        return applyImmune(state, event);
      }
      if (event.tag === 'CHARGE') {
        return applyCharge(state, event);
      }
      if (event.tag === 'SPELL_POWER') {
        return applySpellPower(state, event);
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
      if (event.tag === 'RACE') {
        return applyRace(state, event);
      }
      if (event.tag === 'FATIGUE' || event.tag === 'FATIGUE_COST') {
        return applyFatigue(state, event);
      }
      if (event.tag === 'GAME_TURN') {
        return applyGameTurn(state, event);
      }
      if (event.tag === 'GAME_TYPE') {
        return applyGameType(state, event);
      }
      if (event.tag === 'DISCOVER') {
        return applyDiscover(state, event);
      }
      if (event.tag === 'CARDID') {
        return applyCardId(state, event);
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
        const playerResult = applyTurnsInGame(state, event);
        if (playerResult !== state) return playerResult;
        return applyOpponentTurnsInGame(state, event);
      }
      if (event.tag === 'NUM_MINIONS_ON_BOARD') {
        return applyMinionsOnBoard(state, event);
      }
      if (event.tag === 'NUM_MINIONS_KILLED_THIS_TURN') {
        return applyMinionsKilled(state, event);
      }
      if (event.tag === 'NUM_MINIONS_DIED_THIS_TURN') {
        return applyMinionsDied(state, event);
      }
      if (event.tag === 'NUM_CARDS_DRAWN_THIS_TURN') {
        return applyCardsDrawn(state, event);
      }
      if (event.tag === 'NUM_MINIONS_IN_BOB_DECK') {
        return applyShopSize(state, event);
      }
      if (event.tag === 'COMBO') {
        return applyCombo(state, event);
      }
      if (event.tag === 'NUM_TURNS_PLAYED') {
        return applyPlayerTurnsPlayed(state, event);
      }
      if (event.tag === 'NUM_REVIVES') {
        const afterRevives = applyRevives(state, event);
        if (afterRevives !== state) {
          return afterRevives;
        }
        return applyOpponentRevives(state, event);
      }
      if (event.tag === 'NUM_BOUNTY_CARDS') {
        return applyBountyCards(state, event);
      }
      if (event.tag === 'NUM_VICTORIES') {
        return applyVictories(state, event);
      }
      if (event.tag === 'TIMEOUT') {
        return applyTurnTimer(state, event);
      }
      if (event.tag === 'NUM_GAME_TURNS') {
        return applyNumGameTurns(state, event);
      }
      if (event.tag === 'NUM_MINIONS_TRADED_THIS_TURN') {
        return applyNumMinionsTraded(state, event);
      }
      if (event.tag === 'NUM_CHOICES') {
        return applyNumChoices(state, event);
      }
      if (event.tag === 'NUM_CARDS_PLAYED') {
        return applyTotalCardsPlayed(state, event);
      }
      if (event.tag === 'NUM_CARDS_DRAWN') {
        return applyTotalCardsDrawn(state, event);
      }
      if (event.tag === 'NUM_DEATHRATTLES_TRIGGERED_THIS_TURN') {
        return applyDeathrattlesTriggered(state, event);
      }
      return applyTripleBonus(state, event);
    }

    default:
      return state;
  }
}
