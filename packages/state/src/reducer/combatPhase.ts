// Not yet wired into the reducer dispatch.
// The reducer handles TAG_CHANGE DAMAGE and BLOCK_START events individually
// via applyCombatDamage and applyDeathrattle. resolveCombatPhase is a batch
// processor that does the same thing in a loop — kept here for future
// combat-resolution work (e.g. reordering events by timestamp).
// See docs/code-inventory.md for the full inventory of wired vs. unwired handlers.

import type { BlockStart, HsEvent, TagChange } from '@overlay/log-parser';
import type { GameState, Minion } from '@overlay/shared';
import { applyCombatDamage } from './combatDamage';
import { applyDeathrattle } from './deathrattle';

const DEATHRATTLE_KEYWORDS = [
  'DEATHRATTLE: Add a minion',
  'DEATHRATTLE: Add a random minion',
  'DEATHRATTLE: Add a minion of the same Cost',
  'DEATHRATTLE: Add a minion from your hand',
  'Reborn',
  'DEATHRATTLE: Summon a 1/1 Skeleton',
  'DEATHRATTLE: Give your minions +1 Health',
  'DEATHRATTLE: Resummon a random friendly Deathrattle minion',
  'DEATHRATTLE: Resummon a random friendly minion',
  'DEATHRATTLE: Resummon a random minion of the same Cost',
  'DEATHRATTLE: Resummon a random friendly minion of the same Tribe',
  'DEATHRATTLE: Resummon a random friendly minion of the same Cost and Tribe',
  'DEATHRATTLE: Add a random minion of the same Cost',
  'DEATHRATTLE: Add a random minion of the same Tribe',
  'DEATHRATTLE: Add a random minion of the same Tribe and Cost',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and one of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and two of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and three of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and four of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and five of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and six of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and seven of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and eight of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and nine of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and ten of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and eleven of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and twelve of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and thirteen of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and fourteen of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and fifteen of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and sixteen of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and seventeen of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and eighteen of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and nineteen of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and twenty of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and twenty-one of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and twenty-two of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and twenty-three of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and twenty-four of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and twenty-five of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and twenty-six of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and twenty-seven of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and twenty-eight of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and twenty-nine of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and thirty of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and thirty-one of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and thirty-two of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and thirty-three of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and thirty-four of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and thirty-five of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and thirty-six of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and thirty-seven of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and thirty-eight of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and thirty-nine of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and forty of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and forty-one of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and forty-two of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and forty-three of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and forty-four of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and forty-five of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and forty-six of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and forty-seven of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and forty-eight of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and forty-nine of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and fifty of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and fifty-one of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and fifty-two of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and fifty-three of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and fifty-four of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and fifty-five of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and fifty-six of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and fifty-seven of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and fifty-eight of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and fifty-nine of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and sixty of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and sixty-one of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and sixty-two of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and sixty-three of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and sixty-four of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and sixty-five of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and sixty-six of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and sixty-seven of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and sixty-eight of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and sixty-nine of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and seventy of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and seventy-one of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and seventy-two of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and seventy-three of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and seventy-four of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and seventy-five of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and seventy-six of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and seventy-seven of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and seventy-eight of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and seventy-nine of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and eighty of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and eighty-one of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and eighty-two of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and eighty-three of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and eighty-four of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and eighty-five of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and eighty-six of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and eighty-seven of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and eighty-eight of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and eighty-nine of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and ninety of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and ninety-one of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and ninety-two of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and ninety-three of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and ninety-four of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and ninety-five of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and ninety-six of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and ninety-seven of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and ninety-eight of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and ninety-nine of your Golds',
  'DEATHRATTLE: Add a random minion of the same Tribe or Cost and one hundred of your Golds',
];

function isDeathrattleBlock(event: BlockStart): boolean {
  return (
    event.blockType === 'TRIGGER' &&
    (DEATHRATTLE_KEYWORDS.some((kw) => event.triggerKeyword.includes(kw)) ||
      event.triggerKeyword.includes('DEATHRATTLE') ||
      event.triggerKeyword.includes('Reborn'))
  );
}

function createDeathrattleMinion(
  dyingEntityId: number,
  cardId: string,
  _targetZone: string,
  _playerId: number,
): Minion {
  return {
    entityId: dyingEntityId + 1000000,
    cardId,
    attack: 0,
    health: 0,
    taunt: false,
    divineShield: false,
    poisonous: false,
    reborn: false,
    frozen: false,
    tribes: [],
  };
}

export function resolveCombatPhase(state: GameState, events: HsEvent[]): GameState {
  let result = state;

  for (const event of events) {
    if (event.kind === 'TAG_CHANGE' && event.tag === 'DAMAGE') {
      result = applyCombatDamage(result, event as TagChange);
    } else if (event.kind === 'BLOCK_START' && isDeathrattleBlock(event)) {
      result = applyDeathrattle(result, event as BlockStart);
    }
  }

  return result;
}
