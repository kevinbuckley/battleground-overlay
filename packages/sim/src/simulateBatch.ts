import { simulateBattle } from '@firestone-hs/simulate-bgs-battle';
import { AllCardsService } from '@firestone-hs/reference-data';
import { CardsData } from '@firestone-hs/simulate-bgs-battle/dist/cards/cards-data';
import type { BgsBattleInfo } from '@firestone-hs/simulate-bgs-battle/dist/bgs-battle-info';
import type { BgsBoardInfo } from '@firestone-hs/simulate-bgs-battle/dist/bgs-board-info';
import type { BgsBattleOptions } from '@firestone-hs/simulate-bgs-battle/dist/bgs-battle-options';
import type { BatchResult } from './index';
import { fromFirestoneTranscript } from './fromTranscript';

let cardsService: AllCardsService | null = null;
let cardsDataCached: CardsData | null = null;

function getCards(): { allCards: AllCardsService; data: CardsData } {
  if (!cardsService) {
    cardsService = new AllCardsService();
    cardsService.initializeCardsDbFromCards([]);
    cardsDataCached = new CardsData(cardsService, false);
  }
  return { allCards: cardsService, data: cardsDataCached! };
}

export function simulateBatch(
  playerBoard: BgsBoardInfo,
  opponentBoard: BgsBoardInfo,
  n: number,
  _seed?: number,
): BatchResult {
  const { allCards, data } = getCards();

  const options: BgsBattleOptions = { numberOfSimulations: n };

  const battleInfo: BgsBattleInfo = {
    playerBoard,
    opponentBoard,
    options,
    gameState: { currentTurn: 1 },
  };

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
}
