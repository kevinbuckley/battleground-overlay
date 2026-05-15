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
}

export interface GameState {
  turn: number;
  phase: 'lobby' | 'shopping' | 'combat' | 'end';
  lobbySize: number;
  anomaly: string | null;
  player: PlayerState;
  opponents: OpponentState[];
}
