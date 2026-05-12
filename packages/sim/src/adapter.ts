import type { Board, Minion, PlayerState } from '@overlay/shared';
import type { BgsBoardInfo } from '@firestone-hs/simulate-bgs-battle/dist/bgs-battle-info';
import type { BoardEntity } from '@firestone-hs/simulate-bgs-battle/dist/board-entity';

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
