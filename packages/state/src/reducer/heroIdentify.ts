import type { ShowEntity } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';

export function applyHeroIdentify(state: GameState, event: ShowEntity): GameState {
  if (!event.cardId.startsWith('Hero_')) return state;

  const entityId = Number.parseInt(event.entity, 10);
  if (Number.isNaN(entityId)) return state;

  // If the player's hero is already identified, skip
  if (state.player.hero.entityId !== 0) return state;

  // Look up this entity in the registry to find its controller
  const entityInfo = state.player.entityRegistry.get(entityId);
  if (!entityInfo) return state;

  // If this entity belongs to the player, set the hero cardId
  if (entityInfo.controller === state.player.playerId) {
    return {
      ...state,
      player: {
        ...state.player,
        hero: { ...state.player.hero, cardId: event.cardId },
      },
    };
  }

  // Check if this entity belongs to any opponent
  for (let i = 0; i < state.opponents.length; i++) {
    const opp = state.opponents[i];
    if (!opp) continue;
    if (entityInfo.controller === opp.playerId) {
      return {
        ...state,
        opponents: state.opponents.map((op, idx) =>
          idx === i ? { ...op, hero: { ...op.hero, cardId: event.cardId } } : op,
        ),
      };
    }
  }

  return state;
}
