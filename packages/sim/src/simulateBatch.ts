import { AllCardsService } from '@firestone-hs/reference-data';
import { simulateBattle } from '@firestone-hs/simulate-bgs-battle';
import type { BgsBattleInfo } from '@firestone-hs/simulate-bgs-battle/dist/bgs-battle-info';
import type { BgsBattleOptions } from '@firestone-hs/simulate-bgs-battle/dist/bgs-battle-options';
import type { BgsBoardInfo } from '@firestone-hs/simulate-bgs-battle/dist/bgs-board-info';
import { CardsData } from '@firestone-hs/simulate-bgs-battle/dist/cards/cards-data';
import { loadCards } from '@overlay/card-data';
import { fromFirestoneTranscript } from './fromTranscript';
import type { BatchResult } from './index';

let cardsService: AllCardsService | null = null;
let cardsDataCached: CardsData | null = null;

function getCards(): { allCards: AllCardsService; data: CardsData } {
  if (!cardsService) {
    cardsService = new AllCardsService();
    cardsService.initializeCardsDbFromCards(loadCards());
    cardsDataCached = new CardsData(cardsService, false);
  }
  if (!cardsDataCached) {
    throw new Error('CardsData failed to initialize');
  }
  return { allCards: cardsService, data: cardsDataCached };
}

export function simulateBatch(
  playerBoard: BgsBoardInfo,
  opponentBoard: BgsBoardInfo,
  n: number,
  seed?: number,
): BatchResult {
  const { allCards, data } = getCards();

  const options: BgsBattleOptions = { numberOfSimulations: n, skipInfoLogs: true };

  const battleInfo: BgsBattleInfo = {
    playerBoard,
    opponentBoard,
    options,
    gameState: { currentTurn: 1 },
  };

  return withSeededRandom(seed ?? hashBattle(playerBoard, opponentBoard, n), () => {
    const gen = simulateBattle(battleInfo, allCards, data);
    let result = gen.next().value;

    let next = gen.next();
    while (!next.done) {
      if (next.value) result = next.value;
      next = gen.next();
    }

    if (!result) {
      return { wins: 0, losses: 0, ties: 0 };
    }

    const transcript = fromFirestoneTranscript(result);
    return { wins: transcript.wins, losses: transcript.losses, ties: transcript.ties };
  });
}

function withSeededRandom<T>(seed: number, fn: () => T): T {
  const originalRandom = Math.random;
  Math.random = mulberry32(seed);
  try {
    return fn();
  } finally {
    Math.random = originalRandom;
  }
}

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function hashBattle(playerBoard: BgsBoardInfo, opponentBoard: BgsBoardInfo, n: number): number {
  let hash = 2166136261;
  const input = JSON.stringify({ playerBoard, opponentBoard, n });
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0 || 1;
}
