import { describe, expect, it } from 'bun:test';
import type { OpponentState } from '@overlay/shared';
import { clearOpponentPanel, getOpponentPanel, setOpponentPanel } from '@overlay/shared';

function makeOpponent(id: number, tier: number, hp: number, eliminated = false): OpponentState {
  return {
    entityId: id,
    playerId: id,
    hero: { entityId: id, cardId: `hero_${id}`, hp, armor: 0 },
    board: { minions: [] },
    tier,
    eliminated,
  };
}

describe('opponentPanel', () => {
  it('getOpponentPanel returns empty opponents when no panel is set', () => {
    clearOpponentPanel();
    expect(getOpponentPanel().opponents).toEqual([]);
  });

  it('setOpponentPanel stores the opponents list', () => {
    clearOpponentPanel();
    const opponents: OpponentState[] = [makeOpponent(1, 5, 30), makeOpponent(2, 6, 15)];
    setOpponentPanel({ opponents });
    expect(getOpponentPanel().opponents).toHaveLength(2);
    expect(getOpponentPanel().opponents[0].tier).toBe(5);
    expect(getOpponentPanel().opponents[1].hero?.hp).toBe(15);
  });

  it('clearOpponentPanel resets to empty opponents', () => {
    clearOpponentPanel();
    setOpponentPanel({ opponents: [makeOpponent(3, 7, 20)] });
    expect(getOpponentPanel().opponents).toHaveLength(1);
    clearOpponentPanel();
    expect(getOpponentPanel().opponents).toEqual([]);
  });
});
