export interface Minion {
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
  windfury: boolean;
  cleave: boolean;
  elite: boolean;
  lifesteal: boolean;
  cost: number;
  tribes: string[];
  spellPower: number;
  exhausted: boolean;
  magnetic: boolean;
  immune: boolean;
  charge: boolean;
}

export interface Board {
  minions: Minion[];
}

export interface Shop {
  minions: Minion[];
  frozen: boolean;
  rollCost: number;
}

export interface Hero {
  entityId: number;
  cardId: string;
  hp: number;
  armor: number;
}

export interface PlayerState {
  entityId: number;
  playerId: number;
  /** Battle.net display tag (e.g. "kbux#11815"); some HS log lines reference the player by name. */
  name: string;
  hero: Hero;
  board: Board;
  shop: Shop;
  hand: number[];
  gold: number;
  tier: number;
  tierUpCost: number;
  eliminated: boolean;
  pendingTriple: string | null;
  heroPowerUsedThisTurn: boolean;
  handSize: number;
  trinketUsed: boolean;
  cardsPlayedThisTurn: number;
  cardsGivenThisTurn: number;
  deckSize: number;
  heroPowerCardId: string | null;
  heroPowerCost: number;
  turnsInGame: number;
  minionsOnBoard: number;
  minionsKilledThisTurn: number;
  cardsDrawnThisTurn: number;
  goldSpentThisTurn: number;
  shopSize: number;
  discoveredCardId: string | null;
  combo: number;
  turnsPlayed: number;
  revives: number;
  bountyCards: number;
  victories: number;
  gameType: string | null;
  turnTimer: number;
  numGameTurns: number;
  minionsTradedThisTurn: number;
  numChoices: number;
  gameTurn: number;
  deathrattlesTriggeredThisTurn: number;
  minionsDiedThisTurn: number;
  totalCardsPlayed: number;
  totalCardsDrawn: number;
  entityRegistry: Map<number, { cardId: string; zone: string; controller: number }>;
}

export interface OpponentState {
  entityId: number;
  playerId: number;
  hero: Hero;
  board: Board;
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
}

export interface GameState {
  turn: number;
  phase: 'lobby' | 'shopping' | 'combat' | 'end';
  lobbySize: number;
  anomaly: string | null;
  player: PlayerState;
  opponents: OpponentState[];
}
