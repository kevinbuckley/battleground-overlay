import type { GameState, Recommendation } from '@overlay/shared';
import { exportReport } from './exportReport';

function makeState(
  turn: number,
  phase: GameState['phase'] = 'shopping',
  playerTier = 5,
  hp = 30,
  gold = 8,
  boardMinions: { cardId: string; attack: number; health: number }[] = [],
  opponents: { tier: number; hp: number; eliminated: boolean }[] = [],
): GameState {
  return {
    turn,
    phase,
    player: {
      entityId: 1,
      playerId: 1,
      hero: { entityId: 1, cardId: 'HERO_1', hp, armor: 0 },
      board: {
        minions: boardMinions.map((m) => ({
          entityId: 0,
          cardId: m.cardId,
          attack: m.attack,
          health: m.health,
          taunt: false,
          divineShield: false,
          poisonous: false,
          reborn: false,
          frozen: false,
          tribes: [],
        })),
      },
      shop: { minions: [], frozen: false, rollCost: 1 },
      gold,
      tier: playerTier,
      tierUpCost: 4,
      eliminated: false,
      entityRegistry: new Map(),
    },
    opponents: opponents.map((o, i) => ({
      entityId: i + 2,
      playerId: i + 2,
      hero: { entityId: i + 2, cardId: `OPP_${i}`, hp: o.hp, armor: 0 },
      board: { minions: [] },
      tier: o.tier,
      eliminated: o.eliminated,
    })),
  };
}

function makeRec(type: Recommendation['action']['type'], score = 0.5): Recommendation {
  if (type === 'Buy') {
    return {
      action: { type: 'Buy', cardId: 'TEST', shopIndex: 0 },
      score,
      confidence: 0.8,
      reason: '',
    };
  }
  if (type === 'Sell') {
    return { action: { type: 'Sell', boardIndex: 0 }, score, confidence: 0.8, reason: '' };
  }
  if (type === 'Freeze') {
    return { action: { type: 'Freeze' }, score, confidence: 0.8, reason: '' };
  }
  if (type === 'Reroll') {
    return { action: { type: 'Reroll' }, score, confidence: 0.8, reason: '' };
  }
  if (type === 'TierUp') {
    return { action: { type: 'TierUp' }, score, confidence: 0.8, reason: '' };
  }
  return {
    action: { type: 'Reposition', fromIndex: 0, toIndex: 1 },
    score,
    confidence: 0.8,
    reason: '',
  };
}

describe('exportReport', () => {
  it('returns a string containing "## Turn" for a single turn', () => {
    const state = makeState(1);
    const recs: Recommendation[] = [makeRec('Buy')];
    const result = exportReport([{ state, recs }]);
    expect(result).toContain('## Turn 1');
  });

  it('includes top 3 recommendations', () => {
    const state = makeState(3);
    const recs: Recommendation[] = [
      makeRec('Buy', 0.9),
      makeRec('Sell', 0.7),
      makeRec('TierUp', 0.5),
      makeRec('Reroll', 0.3),
    ];
    const result = exportReport([{ state, recs }]);
    expect(result).toContain('Buy (score 0.9)');
    expect(result).toContain('Sell (score 0.7)');
    expect(result).toContain('TierUp (score 0.5)');
    expect(result).not.toContain('Reroll');
  });

  it('handles empty recommendations', () => {
    const state = makeState(2);
    const result = exportReport([{ state, recs: [] }]);
    expect(result).toContain('## Turn 2');
    expect(result).not.toContain('Recommendations:');
  });

  it('handles multiple turns', () => {
    const state1 = makeState(1);
    const state2 = makeState(5, 'combat', 7, 15, 4);
    const result = exportReport([
      { state: state1, recs: [makeRec('Buy')] },
      { state: state2, recs: [makeRec('TierUp')] },
    ]);
    expect(result).toContain('## Turn 1');
    expect(result).toContain('## Turn 5');
    expect(result).toContain('Phase: combat');
    expect(result).toContain('Player: Tier 7, HP 15, Gold 4');
  });

  it('shows board minions when present', () => {
    const state = makeState(4, 'shopping', 5, 30, 8, [
      { cardId: 'CSW_Quick', attack: 3, health: 2 },
    ]);
    const result = exportReport([{ state, recs: [] }]);
    expect(result).toContain('CSW_Quick');
  });

  it('shows "(empty)" when no board minions', () => {
    const state = makeState(1);
    const result = exportReport([{ state, recs: [] }]);
    expect(result).toContain('Board: (empty)');
  });

  it('shows opponent info when opponents exist', () => {
    const state = makeState(3, 'shopping', 5, 30, 8, [], [{ tier: 6, hp: 20, eliminated: false }]);
    const result = exportReport([{ state, recs: [] }]);
    expect(result).toContain('Tier 6');
    expect(result).toContain('HP 20');
  });
});
