import type { GameState } from '@overlay/shared';

export function resolveCardId(entityId: number, state: GameState): string | null {
  const registry = state.player.entityRegistry;
  const info = registry.get(entityId);
  if (!info) return null;
  return info.cardId;
}
