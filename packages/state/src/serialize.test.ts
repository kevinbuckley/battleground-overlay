import { describe, expect, it } from 'bun:test';
import { initialState } from './initialState';
import { deserializeGameState, serializeGameState } from './serialize';

function makeFullState(): ReturnType<typeof initialState> {
  const state = initialState();
  state.turn = 5;
  state.phase = 'shopping';
  state.player.gold = 8;
  state.player.tier = 5;
  state.player.tierUpCost = 4;
  state.player.hero.hp = 20;
  state.player.hero.armor = 5;
  state.player.board.minions.push(
    {
      entityId: 1,
      cardId: 'CS2_181',
      attack: 3,
      health: 2,
      taunt: false,
      divineShield: false,
      poisonous: false,
      reborn: false,
      frozen: false,
      golden: false,
      tribes: ['Pirate'],
    },
    {
      entityId: 2,
      cardId: 'UNG_912',
      attack: 5,
      health: 5,
      taunt: true,
      divineShield: true,
      poisonous: false,
      reborn: false,
      frozen: false,
      golden: true,
      tribes: ['Murloc', 'Dragon'],
    },
  );
  state.player.shop.minions.push({
    entityId: 10,
    cardId: 'BG2_001',
    attack: 2,
    health: 3,
    taunt: false,
    divineShield: false,
    poisonous: false,
    reborn: false,
    frozen: false,
    golden: false,
    tribes: ['Murloc'],
  });
  state.player.hand = [100, 101];
  state.player.entityRegistry.set(1, { cardId: 'CS2_181', zone: 'PLAY', controller: 0 });
  state.player.entityRegistry.set(2, { cardId: 'UNG_912', zone: 'PLAY', controller: 0 });
  state.opponents.push({
    entityId: 3,
    playerId: 1,
    hero: { entityId: 3, cardId: 'HERO01', hp: 30, armor: 0 },
    board: { minions: [] },
    tier: 4,
    eliminated: false,
  });
  return state;
}

describe('serializeGameState', () => {
  it('produces valid JSON string', () => {
    const state = initialState();
    const json = serializeGameState(state);
    expect(typeof json).toBe('string');
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('round-trips turn, phase, board length, shop length', () => {
    const state = makeFullState();
    const json = serializeGameState(state);
    const restored = deserializeGameState(json);

    expect(restored.turn).toBe(state.turn);
    expect(restored.phase).toBe(state.phase);
    expect(restored.player.board.minions.length).toBe(state.player.board.minions.length);
    expect(restored.player.shop.minions.length).toBe(state.player.shop.minions.length);
  });

  it('preserves entityRegistry as Map after round-trip', () => {
    const state = makeFullState();
    const json = serializeGameState(state);
    const restored = deserializeGameState(json);

    expect(restored.player.entityRegistry instanceof Map).toBe(true);
    expect(restored.player.entityRegistry.size).toBe(state.player.entityRegistry.size);
  });

  it('preserves opponent count and eliminated status', () => {
    const state = makeFullState();
    const json = serializeGameState(state);
    const restored = deserializeGameState(json);

    expect(restored.opponents.length).toBe(state.opponents.length);
    expect(restored.opponents[0]?.eliminated).toBe(state.opponents[0]?.eliminated);
  });

  it('preserves hero hp and armor', () => {
    const state = makeFullState();
    const json = serializeGameState(state);
    const restored = deserializeGameState(json);

    expect(restored.player.hero.hp).toBe(state.player.hero.hp);
    expect(restored.player.hero.armor).toBe(state.player.hero.armor);
  });

  it('preserves minion attributes through round-trip', () => {
    const state = makeFullState();
    const json = serializeGameState(state);
    const restored = deserializeGameState(json);

    const minions = restored.player.board.minions;
    expect(minions.length).toBeGreaterThanOrEqual(2);
    expect(minions[1].golden).toBe(true);
    expect(minions[1].taunt).toBe(true);
    expect(minions[1].divineShield).toBe(true);
    expect(minions[1].tribes).toEqual(['Murloc', 'Dragon']);
  });

  it('preserves hand, gold, tier, tierUpCost', () => {
    const state = makeFullState();
    const json = serializeGameState(state);
    const restored = deserializeGameState(json);

    expect(restored.player.hand).toEqual(state.player.hand);
    expect(restored.player.gold).toBe(state.player.gold);
    expect(restored.player.tier).toBe(state.player.tier);
    expect(restored.player.tierUpCost).toBe(state.player.tierUpCost);
  });

  it('round-trips initialState() — turn, phase, gold, tier, opponents length', () => {
    const state = initialState();
    const json = serializeGameState(state);
    const restored = deserializeGameState(json);

    expect(restored.turn).toBe(state.turn);
    expect(restored.phase).toBe(state.phase);
    expect(restored.player.gold).toBe(state.player.gold);
    expect(restored.player.tier).toBe(state.player.tier);
    expect(restored.opponents.length).toBe(state.opponents.length);
  });

  it('restores entityRegistry Map entries after round-trip', () => {
    const state = initialState();
    state.player.entityRegistry.set(42, {
      cardId: 'CS2_181',
      zone: 'PLAY',
      controller: 0,
    });
    const json = serializeGameState(state);
    const restored = deserializeGameState(json);

    const entry = restored.player.entityRegistry.get(42);
    expect(entry).toBeDefined();
    expect(entry!.cardId).toBe('CS2_181');
    expect(entry!.zone).toBe('PLAY');
    expect(entry!.controller).toBe(0);
  });

  it('round-trips opponent tracking fields', () => {
    const state = initialState();
    state.opponents = [
      {
        entityId: 3,
        playerId: 1,
        hero: { entityId: 3, cardId: 'HERO01', hp: 30, armor: 0 },
        board: { minions: [] },
        tier: 5,
        eliminated: false,
        turnsPlayed: 8,
        revives: 1,
        turnsInGame: 12,
        totalCardsPlayed: 15,
        totalCardsDrawn: 20,
        minionsOnBoard: 3,
        minionsKilledThisTurn: 2,
        cardsDrawnThisTurn: 3,
        cardsGivenThisTurn: 1,
        cardsPlayedThisTurn: 2,
        deckSize: 18,
        combo: 2,
        bountyCards: 3,
        victories: 1,
        gameType: 'BATTLEGROUNDS',
        turnTimer: 15,
        numGameTurns: 12,
        numChoices: 3,
        deathrattlesTriggeredThisTurn: 1,
        minionsDiedThisTurn: 2,
        minionsTradedThisTurn: 3,
      },
      {
        entityId: 4,
        playerId: 2,
        hero: { entityId: 4, cardId: 'HERO02', hp: 15, armor: 10 },
        board: { minions: [] },
        tier: 3,
        eliminated: true,
        turnsPlayed: 4,
        revives: 0,
        turnsInGame: 6,
        totalCardsPlayed: 5,
        totalCardsDrawn: 8,
        minionsOnBoard: 0,
        minionsKilledThisTurn: 0,
        cardsDrawnThisTurn: 0,
        cardsGivenThisTurn: 0,
        cardsPlayedThisTurn: 0,
        deckSize: 25,
        combo: 0,
        bountyCards: 0,
        victories: 0,
        gameType: null,
        turnTimer: 0,
        numGameTurns: 6,
        numChoices: 0,
        deathrattlesTriggeredThisTurn: 0,
        minionsDiedThisTurn: 0,
        minionsTradedThisTurn: 0,
      },
    ];
    const json = serializeGameState(state);
    const restored = deserializeGameState(json);

    expect(restored.opponents.length).toBe(2);
    expect(restored.opponents[0].turnsPlayed).toBe(8);
    expect(restored.opponents[0].revives).toBe(1);
    expect(restored.opponents[0].turnsInGame).toBe(12);
    expect(restored.opponents[0].totalCardsPlayed).toBe(15);
    expect(restored.opponents[0].totalCardsDrawn).toBe(20);
    expect(restored.opponents[0].minionsOnBoard).toBe(3);
    expect(restored.opponents[0].minionsKilledThisTurn).toBe(2);
    expect(restored.opponents[0].cardsDrawnThisTurn).toBe(3);
    expect(restored.opponents[0].cardsGivenThisTurn).toBe(1);
    expect(restored.opponents[0].cardsPlayedThisTurn).toBe(2);
    expect(restored.opponents[0].deckSize).toBe(18);
    expect(restored.opponents[0].combo).toBe(2);
    expect(restored.opponents[0].bountyCards).toBe(3);
    expect(restored.opponents[0].victories).toBe(1);
    expect(restored.opponents[0].gameType).toBe('BATTLEGROUNDS');
    expect(restored.opponents[0].turnTimer).toBe(15);
    expect(restored.opponents[0].numGameTurns).toBe(12);
    expect(restored.opponents[0].numChoices).toBe(3);
    expect(restored.opponents[0].deathrattlesTriggeredThisTurn).toBe(1);
    expect(restored.opponents[0].minionsDiedThisTurn).toBe(2);
    expect(restored.opponents[0].minionsTradedThisTurn).toBe(3);
    expect(restored.opponents[1].eliminated).toBe(true);
    expect(restored.opponents[1].gameType).toBeNull();
  });

  it('deserializes old format without opponent fields gracefully', () => {
    const oldJson = JSON.stringify({
      turn: 3,
      phase: 'shopping',
      player: {
        entityId: 0,
        playerId: 0,
        hero: { entityId: 0, cardId: 'HERO01', hp: 30, armor: 0 },
        board: { minions: [] },
        shop: { minions: [], frozen: false, rollCost: 1 },
        hand: [],
        gold: 3,
        tier: 3,
        tierUpCost: 3,
        eliminated: false,
        pendingTriple: null,
        heroPowerUsedThisTurn: false,
        entityRegistry: [],
      },
      opponents: [
        {
          entityId: 3,
          playerId: 1,
          hero: { entityId: 3, cardId: 'HERO01', hp: 30, armor: 0 },
          board: { minions: [] },
          tier: 3,
          eliminated: false,
        },
      ],
    });
    const restored = deserializeGameState(oldJson);
    expect(restored.opponents.length).toBe(1);
    expect(restored.opponents[0].turnsPlayed).toBe(0);
    expect(restored.opponents[0].turnsInGame).toBe(0);
    expect(restored.opponents[0].gameType).toBeNull();
  });

  it('round-trips lobbySize and anomaly', () => {
    const state = initialState();
    state.lobbySize = 6;
    state.anomaly = 'SomeAnomaly';
    const json = serializeGameState(state);
    const restored = deserializeGameState(json);
    expect(restored.lobbySize).toBe(6);
    expect(restored.anomaly).toBe('SomeAnomaly');
  });

  it('round-trips anomaly=null', () => {
    const state = initialState();
    state.lobbySize = 8;
    state.anomaly = null;
    const json = serializeGameState(state);
    const restored = deserializeGameState(json);
    expect(restored.lobbySize).toBe(8);
    expect(restored.anomaly).toBeNull();
  });

  it('deserializes old format without lobbySize/anomaly gracefully', () => {
    const oldJson = JSON.stringify({
      turn: 3,
      phase: 'shopping',
      player: {
        entityId: 0,
        playerId: 0,
        hero: { entityId: 0, cardId: 'HERO01', hp: 30, armor: 0 },
        board: { minions: [] },
        shop: { minions: [], frozen: false, rollCost: 1 },
        hand: [],
        gold: 3,
        tier: 3,
        tierUpCost: 3,
        eliminated: false,
        pendingTriple: null,
        heroPowerUsedThisTurn: false,
        entityRegistry: [],
      },
      opponents: [
        {
          entityId: 3,
          playerId: 1,
          hero: { entityId: 3, cardId: 'HERO01', hp: 30, armor: 0 },
          board: { minions: [] },
          tier: 3,
          eliminated: false,
        },
      ],
    });
    const restored = deserializeGameState(oldJson);
    expect(restored.lobbySize).toBe(8);
    expect(restored.anomaly).toBeNull();
  });

  it('round-trips opponent with non-default values for all 22 fields', () => {
    const state = initialState();
    state.opponents = [
      {
        entityId: 100,
        playerId: 5,
        hero: { entityId: 100, cardId: 'MECH_0x00', hp: 25, armor: 7 },
        board: { minions: [] },
        tier: 6,
        eliminated: false,
        turnsPlayed: 10,
        revives: 2,
        turnsInGame: 15,
        totalCardsPlayed: 22,
        totalCardsDrawn: 30,
        minionsOnBoard: 4,
        minionsKilledThisTurn: 3,
        cardsDrawnThisTurn: 5,
        cardsGivenThisTurn: 2,
        cardsPlayedThisTurn: 4,
        deckSize: 12,
        combo: 3,
        bountyCards: 5,
        victories: 2,
        gameType: 'BATTLEGROUNDS',
        turnTimer: 10,
        numGameTurns: 15,
        numChoices: 5,
        deathrattlesTriggeredThisTurn: 2,
        minionsDiedThisTurn: 4,
        minionsTradedThisTurn: 5,
      },
    ];
    const json = serializeGameState(state);
    const restored = deserializeGameState(json);
    const o = restored.opponents[0];
    expect(o.entityId).toBe(100);
    expect(o.playerId).toBe(5);
    expect(o.tier).toBe(6);
    expect(o.eliminated).toBe(false);
    expect(o.turnsPlayed).toBe(10);
    expect(o.revives).toBe(2);
    expect(o.turnsInGame).toBe(15);
    expect(o.totalCardsPlayed).toBe(22);
    expect(o.totalCardsDrawn).toBe(30);
    expect(o.minionsOnBoard).toBe(4);
    expect(o.minionsKilledThisTurn).toBe(3);
    expect(o.cardsDrawnThisTurn).toBe(5);
    expect(o.cardsGivenThisTurn).toBe(2);
    expect(o.cardsPlayedThisTurn).toBe(4);
    expect(o.deckSize).toBe(12);
    expect(o.combo).toBe(3);
    expect(o.bountyCards).toBe(5);
    expect(o.victories).toBe(2);
    expect(o.gameType).toBe('BATTLEGROUNDS');
    expect(o.turnTimer).toBe(10);
    expect(o.numGameTurns).toBe(15);
    expect(o.numChoices).toBe(5);
    expect(o.deathrattlesTriggeredThisTurn).toBe(2);
    expect(o.minionsDiedThisTurn).toBe(4);
    expect(o.minionsTradedThisTurn).toBe(5);
  });
});
