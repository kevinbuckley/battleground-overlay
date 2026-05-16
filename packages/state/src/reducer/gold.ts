import type { TagChange } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';
import { entityRefersToPlayer } from '../entityId';

export function applyGold(state: GameState, event: TagChange): GameState {
  if (!entityRefersToPlayer(event.entity, state)) return state;

  const gold = Number.parseInt(event.value, 10);
  if (Number.isNaN(gold)) return state;

  return { ...state, player: { ...state.player, gold } };
}
