import { describe, expect, it } from 'bun:test';
import { simulateBattle } from '@firestone-hs/simulate-bgs-battle';
import { AllCardsService } from '@firestone-hs/reference-data';
import { CardsData } from '@firestone-hs/simulate-bgs-battle/dist/cards/cards-data';
import type { BgsBattleInfo } from '@firestone-hs/simulate-bgs-battle/dist/bgs-battle-info';

describe('simulateBattle smoke test', () => {
  it('runs a trivial one-minion matchup and returns non-null output', () => {
    const allCards = new AllCardsService();
    // Minimal card stub required by the simulator
    allCards.initializeCardsDbFromCards([
      {
        id: 'CS2_168',
        dbfId: 1463,
        name: 'Murloc Tidecaller',
        set: 'CORE',
        playerClass: 'NEUTRAL' as never,
        cardClass: 'NEUTRAL',
        text: '',
        collectionText: '',
        flavor: '',
        type: 'MINION',
        mechanics: [],
        attack: 1,
        health: 1,
      },
    ]);

    const cardsData = new CardsData(allCards, false);

    const board = {
      player: {
        cardId: 'TB_BaconShop_HERO_KelThuzad',
        hpLeft: 40,
        tavernTier: 1,
        heroPowers: [],
        questEntities: [],
      },
      board: [
        {
          entityId: 1,
          cardId: 'CS2_168',
          attack: 1,
          health: 1,
        },
      ],
    };

    const battleInfo: BgsBattleInfo = {
      playerBoard: board,
      opponentBoard: board,
      options: { numberOfSimulations: 1 },
      gameState: { currentTurn: 1 },
    };

    const gen = simulateBattle(battleInfo, allCards, cardsData);
    const result = gen.next().value;
    expect(result).not.toBeNull();
    expect(typeof result.won).toBe('number');
  });
});
