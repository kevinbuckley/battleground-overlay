import type { TagChange } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';

export function applyCombatDamage(state: GameState, event: TagChange): GameState {
  if (event.tag !== 'DAMAGE') return state;

  const entityId = Number.parseInt(event.entity, 10);
  if (Number.isNaN(entityId)) return state;

  const damage = Number.parseInt(event.value, 10);
  if (Number.isNaN(damage)) return state;

  // Check player's hero
  if (entityId === state.player.hero.entityId) {
    const newHp = Math.max(0, state.player.hero.hp - damage);
    return {
      ...state,
      player: {
        ...state.player,
        hero: { ...state.player.hero, hp: newHp },
      },
    };
  }

  // Check player's board minions
  const playerMinions = state.player.board.minions;
  const targetMinion = playerMinions.find((m) => m.entityId === entityId);
  if (targetMinion) {
    // BG combat damage is transient: minions can die during combat but return
    // for the next recruit phase. Keep the persistent shopping board intact.
    if (state.phase === 'combat') return state;
    const newHealth = Math.max(0, targetMinion.health - damage);
    const nextMinions =
      newHealth === 0
        ? playerMinions.filter((m) => m.entityId !== entityId)
        : playerMinions.map((m) => (m.entityId === entityId ? { ...m, health: newHealth } : m));
    return {
      ...state,
      player: {
        ...state.player,
        board: { ...state.player.board, minions: nextMinions },
      },
    };
  }

  // Check opponents' boards
  const nextOpponents = state.opponents.map((opp) => {
    const oppMinions = opp.board.minions;
    const targetOppMinion = oppMinions.find((m) => m.entityId === entityId);
    if (!targetOppMinion) return opp;
    if (state.phase === 'combat') return opp;

    const newHealth = Math.max(0, targetOppMinion.health - damage);
    const nextOppMinions =
      newHealth === 0
        ? oppMinions.filter((m) => m.entityId !== entityId)
        : oppMinions.map((m) => (m.entityId === entityId ? { ...m, health: newHealth } : m));
    return {
      ...opp,
      board: { ...opp.board, minions: nextOppMinions },
    };
  });

  return { ...state, opponents: nextOpponents };
}
