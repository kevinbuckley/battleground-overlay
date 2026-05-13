import type { BgsBoardInfo } from '@firestone-hs/simulate-bgs-battle/dist/bgs-board-info';
import type { BoardEntity } from '@firestone-hs/simulate-bgs-battle/dist/board-entity';
import type { Board, Minion, PlayerState } from '@overlay/shared';

function toFirestoneEntity(minion: Minion, index: number): BoardEntity {
  return {
    entityId: minion.entityId || index + 1,
    cardId: minion.cardId,
    attack: minion.attack,
    health: minion.health,
    taunt: minion.taunt,
    divineShield: minion.divineShield,
    poisonous: minion.poisonous,
    reborn: minion.reborn,
  };
}

export function toFirestoneBoard(board: Board, player: PlayerState): BgsBoardInfo {
  return {
    player: {
      cardId: player.hero.cardId || 'TB_BaconShop_HERO_KelThuzad',
      hpLeft: player.hero.hp,
      tavernTier: player.tier,
      heroPowers: [],
      questEntities: [],
    },
    board: board.minions.map(toFirestoneEntity),
  };
}

export function bgsFormatToBoard(bgsBoard: BgsBoardInfo): Board {
  return {
    minions: bgsBoard.board.map((entity: BoardEntity) => {
      const minion: Minion = {
        entityId: entity.entityId,
        cardId: entity.cardId,
        attack: entity.attack,
        health: entity.health,
        taunt: entity.taunt ?? false,
        divineShield: entity.divineShield ?? false,
        poisonous: entity.poisonous ?? false,
        reborn: entity.reborn ?? false,
        frozen: false,
        golden: false,
        windfury: entity.windfury ?? false,
        cleave: entity.cleave ?? false,
        elite: false,
        cost: 0,
        tribes: [],
      };
      return minion;
    }),
  };
}
