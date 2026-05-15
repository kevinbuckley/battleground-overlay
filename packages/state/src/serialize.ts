import type { GameState } from '@overlay/shared';

function serializeMinion(m: {
  entityId: number;
  cardId: string;
  attack: number;
  health: number;
  taunt: boolean;
  divineShield: boolean;
  poisonous: boolean;
  reborn: boolean;
  frozen: boolean;
  golden: boolean;
  tribes: string[];
}): object {
  return {
    entityId: m.entityId,
    cardId: m.cardId,
    attack: m.attack,
    health: m.health,
    taunt: m.taunt,
    divineShield: m.divineShield,
    poisonous: m.poisonous,
    reborn: m.reborn,
    frozen: m.frozen,
    golden: m.golden,
    tribes: m.tribes,
  };
}

function serializeHero(h: {
  entityId: number;
  cardId: string;
  hp: number;
  armor: number;
}): object {
  return {
    entityId: h.entityId,
    cardId: h.cardId,
    hp: h.hp,
    armor: h.armor,
  };
}

function serializePlayer(p: {
  entityId: number;
  playerId: number;
  hero: { entityId: number; cardId: string; hp: number; armor: number };
  board: {
    minions: {
      entityId: number;
      cardId: string;
      attack: number;
      health: number;
      taunt: boolean;
      divineShield: boolean;
      poisonous: boolean;
      reborn: boolean;
      frozen: boolean;
      golden: boolean;
      tribes: string[];
    }[];
  };
  shop: {
    minions: {
      entityId: number;
      cardId: string;
      attack: number;
      health: number;
      taunt: boolean;
      divineShield: boolean;
      poisonous: boolean;
      reborn: boolean;
      frozen: boolean;
      golden: boolean;
      tribes: string[];
    }[];
    frozen: boolean;
    rollCost: number;
  };
  hand: number[];
  gold: number;
  tier: number;
  tierUpCost: number;
  eliminated: boolean;
  pendingTriple: string | null;
  heroPowerUsedThisTurn: boolean;
  entityRegistry: Map<number, { cardId: string; zone: string; controller: number }>;
}): object {
  return {
    entityId: p.entityId,
    playerId: p.playerId,
    hero: serializeHero(p.hero),
    board: {
      minions: p.board.minions.map(serializeMinion),
    },
    shop: {
      minions: p.shop.minions.map(serializeMinion),
      frozen: p.shop.frozen,
      rollCost: p.shop.rollCost,
    },
    hand: p.hand,
    gold: p.gold,
    tier: p.tier,
    tierUpCost: p.tierUpCost,
    eliminated: p.eliminated,
    pendingTriple: p.pendingTriple,
    heroPowerUsedThisTurn: p.heroPowerUsedThisTurn,
    entityRegistry: Array.from(p.entityRegistry.entries()),
  };
}

function serializeOpponent(o: {
  entityId: number;
  playerId: number;
  hero: { entityId: number; cardId: string; hp: number; armor: number };
  board: {
    minions: {
      entityId: number;
      cardId: string;
      attack: number;
      health: number;
      taunt: boolean;
      divineShield: boolean;
      poisonous: boolean;
      reborn: boolean;
      frozen: boolean;
      golden: boolean;
      tribes: string[];
    }[];
  };
  tier: number;
  eliminated: boolean;
  turnsPlayed: number;
  revives: number;
  turnsInGame: number;
  totalCardsPlayed: number;
  totalCardsDrawn: number;
  minionsOnBoard: number;
  minionsKilledThisTurn: number;
  cardsDrawnThisTurn: number;
  cardsGivenThisTurn: number;
  cardsPlayedThisTurn: number;
  deckSize: number;
  combo: number;
  bountyCards: number;
  victories: number;
  gameType: string | null;
  turnTimer: number;
  numGameTurns: number;
  numChoices: number;
  deathrattlesTriggeredThisTurn: number;
  minionsDiedThisTurn: number;
  minionsTradedThisTurn: number;
}): object {
  return {
    entityId: o.entityId,
    playerId: o.playerId,
    hero: serializeHero(o.hero),
    board: {
      minions: o.board.minions.map(serializeMinion),
    },
    tier: o.tier,
    eliminated: o.eliminated,
    turnsPlayed: o.turnsPlayed,
    revives: o.revives,
    turnsInGame: o.turnsInGame,
    totalCardsPlayed: o.totalCardsPlayed,
    totalCardsDrawn: o.totalCardsDrawn,
    minionsOnBoard: o.minionsOnBoard,
    minionsKilledThisTurn: o.minionsKilledThisTurn,
    cardsDrawnThisTurn: o.cardsDrawnThisTurn,
    cardsGivenThisTurn: o.cardsGivenThisTurn,
    cardsPlayedThisTurn: o.cardsPlayedThisTurn,
    deckSize: o.deckSize,
    combo: o.combo,
    bountyCards: o.bountyCards,
    victories: o.victories,
    gameType: o.gameType,
    turnTimer: o.turnTimer,
    numGameTurns: o.numGameTurns,
    numChoices: o.numChoices,
    deathrattlesTriggeredThisTurn: o.deathrattlesTriggeredThisTurn,
    minionsDiedThisTurn: o.minionsDiedThisTurn,
    minionsTradedThisTurn: o.minionsTradedThisTurn,
  };
}

export function serializeGameState(state: GameState): string {
  const obj = {
    turn: state.turn,
    phase: state.phase,
    player: serializePlayer(state.player),
    opponents: state.opponents.map(serializeOpponent),
  };
  return JSON.stringify(obj);
}

function deserializeMinion(m: object): {
  entityId: number;
  cardId: string;
  attack: number;
  health: number;
  taunt: boolean;
  divineShield: boolean;
  poisonous: boolean;
  reborn: boolean;
  frozen: boolean;
  golden: boolean;
  tribes: string[];
} {
  return {
    entityId: (m as { entityId: number }).entityId,
    cardId: (m as { cardId: string }).cardId,
    attack: (m as { attack: number }).attack,
    health: (m as { health: number }).health,
    taunt: (m as { taunt: boolean }).taunt,
    divineShield: (m as { divineShield: boolean }).divineShield,
    poisonous: (m as { poisonous: boolean }).poisonous,
    reborn: (m as { reborn: boolean }).reborn,
    frozen: (m as { frozen: boolean }).frozen,
    golden: (m as { golden: boolean }).golden,
    tribes: (m as { tribes: string[] }).tribes,
  };
}

function deserializeHero(h: object): {
  entityId: number;
  cardId: string;
  hp: number;
  armor: number;
} {
  return {
    entityId: (h as { entityId: number }).entityId,
    cardId: (h as { cardId: string }).cardId,
    hp: (h as { hp: number }).hp,
    armor: (h as { armor: number }).armor,
  };
}

function deserializePlayer(p: object): {
  entityId: number;
  playerId: number;
  hero: { entityId: number; cardId: string; hp: number; armor: number };
  board: {
    minions: {
      entityId: number;
      cardId: string;
      attack: number;
      health: number;
      taunt: boolean;
      divineShield: boolean;
      poisonous: boolean;
      reborn: boolean;
      frozen: boolean;
      golden: boolean;
      tribes: string[];
    }[];
  };
  shop: {
    minions: {
      entityId: number;
      cardId: string;
      attack: number;
      health: number;
      taunt: boolean;
      divineShield: boolean;
      poisonous: boolean;
      reborn: boolean;
      frozen: boolean;
      golden: boolean;
      tribes: string[];
    }[];
    frozen: boolean;
    rollCost: number;
  };
  hand: number[];
  gold: number;
  tier: number;
  tierUpCost: number;
  eliminated: boolean;
  pendingTriple: string | null;
  heroPowerUsedThisTurn: boolean;
  entityRegistry: Map<number, { cardId: string; zone: string; controller: number }>;
} {
  const entityRegistryEntries = (
    p as { entityRegistry: [number, { cardId: string; zone: string; controller: number }][] }
  ).entityRegistry;
  return {
    entityId: (p as { entityId: number }).entityId,
    playerId: (p as { playerId: number }).playerId,
    hero: deserializeHero((p as { hero: object }).hero),
    board: {
      minions: ((p as { board: { minions: object[] } }).board.minions as object[]).map(
        deserializeMinion,
      ),
    },
    shop: {
      minions: ((p as { shop: { minions: object[] } }).shop.minions as object[]).map(
        deserializeMinion,
      ),
      frozen: (p as { shop: { frozen: boolean } }).shop.frozen,
      rollCost: (p as { shop: { rollCost: number } }).shop.rollCost,
    },
    hand: (p as { hand: number[] }).hand,
    gold: (p as { gold: number }).gold,
    tier: (p as { tier: number }).tier,
    tierUpCost: (p as { tierUpCost: number }).tierUpCost,
    eliminated: (p as { eliminated: boolean }).eliminated,
    pendingTriple: (p as { pendingTriple: string | null }).pendingTriple,
    heroPowerUsedThisTurn: (p as { heroPowerUsedThisTurn: boolean }).heroPowerUsedThisTurn,
    entityRegistry: new Map<number, { cardId: string; zone: string; controller: number }>(
      entityRegistryEntries,
    ),
  };
}

function deserializeOpponent(o: object): {
  entityId: number;
  playerId: number;
  hero: { entityId: number; cardId: string; hp: number; armor: number };
  board: {
    minions: {
      entityId: number;
      cardId: string;
      attack: number;
      health: number;
      taunt: boolean;
      divineShield: boolean;
      poisonous: boolean;
      reborn: boolean;
      frozen: boolean;
      golden: boolean;
      tribes: string[];
    }[];
  };
  tier: number;
  eliminated: boolean;
  turnsPlayed: number;
  revives: number;
  turnsInGame: number;
  totalCardsPlayed: number;
  totalCardsDrawn: number;
  minionsOnBoard: number;
  minionsKilledThisTurn: number;
  cardsDrawnThisTurn: number;
  cardsGivenThisTurn: number;
  cardsPlayedThisTurn: number;
  deckSize: number;
  combo: number;
  bountyCards: number;
  victories: number;
  gameType: string | null;
  turnTimer: number;
  numGameTurns: number;
  numChoices: number;
  deathrattlesTriggeredThisTurn: number;
  minionsDiedThisTurn: number;
  minionsTradedThisTurn: number;
} {
  return {
    entityId: (o as { entityId: number }).entityId,
    playerId: (o as { playerId: number }).playerId,
    hero: deserializeHero((o as { hero: object }).hero),
    board: {
      minions: ((o as { board: { minions: object[] } }).board.minions as object[]).map(
        deserializeMinion,
      ),
    },
    tier: (o as { tier: number }).tier,
    eliminated: (o as { eliminated: boolean }).eliminated,
    turnsPlayed: (o as { turnsPlayed: number }).turnsPlayed ?? 0,
    revives: (o as { revives: number }).revives ?? 0,
    turnsInGame: (o as { turnsInGame: number }).turnsInGame ?? 0,
    totalCardsPlayed: (o as { totalCardsPlayed: number }).totalCardsPlayed ?? 0,
    totalCardsDrawn: (o as { totalCardsDrawn: number }).totalCardsDrawn ?? 0,
    minionsOnBoard: (o as { minionsOnBoard: number }).minionsOnBoard ?? 0,
    minionsKilledThisTurn: (o as { minionsKilledThisTurn: number }).minionsKilledThisTurn ?? 0,
    cardsDrawnThisTurn: (o as { cardsDrawnThisTurn: number }).cardsDrawnThisTurn ?? 0,
    cardsGivenThisTurn: (o as { cardsGivenThisTurn: number }).cardsGivenThisTurn ?? 0,
    cardsPlayedThisTurn: (o as { cardsPlayedThisTurn: number }).cardsPlayedThisTurn ?? 0,
    deckSize: (o as { deckSize: number }).deckSize ?? 0,
    combo: (o as { combo: number }).combo ?? 0,
    bountyCards: (o as { bountyCards: number }).bountyCards ?? 0,
    victories: (o as { victories: number }).victories ?? 0,
    gameType: (o as { gameType: string | null }).gameType ?? null,
    turnTimer: (o as { turnTimer: number }).turnTimer ?? 0,
    numGameTurns: (o as { numGameTurns: number }).numGameTurns ?? 0,
    numChoices: (o as { numChoices: number }).numChoices ?? 0,
    deathrattlesTriggeredThisTurn:
      (o as { deathrattlesTriggeredThisTurn: number }).deathrattlesTriggeredThisTurn ?? 0,
    minionsDiedThisTurn: (o as { minionsDiedThisTurn: number }).minionsDiedThisTurn ?? 0,
    minionsTradedThisTurn: (o as { minionsTradedThisTurn: number }).minionsTradedThisTurn ?? 0,
  };
}

export function deserializeGameState(json: string): GameState {
  const obj = JSON.parse(json) as {
    turn: number;
    phase: 'lobby' | 'shopping' | 'combat' | 'end';
    player: object;
    opponents: object[];
  };
  return {
    turn: obj.turn,
    phase: obj.phase,
    player: deserializePlayer(obj.player),
    opponents: obj.opponents.map(deserializeOpponent),
  };
}
