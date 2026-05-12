import type { GameState, Recommendation } from '@overlay/shared';

export function buildExplainPrompt(
  state: GameState,
  recs: Recommendation[],
): { role: 'system' | 'user'; content: string }[] {
  const topRec = recs[0];
  if (!topRec) {
    return [
      {
        role: 'system',
        content: "You are a Hearthstone Battlegrounds advisor. Explain the player's best move.",
      },
      {
        role: 'user',
        content: 'No recommendations available.',
      },
    ];
  }

  const action = topRec.action;
  let actionDesc: string;
  switch (action.type) {
    case 'Buy':
      actionDesc = `Buy shop minion at index ${action.shopIndex} (cardId: ${action.cardId})`;
      break;
    case 'Sell':
      actionDesc = `Sell board minion at index ${action.boardIndex}`;
      break;
    case 'Freeze':
      actionDesc = 'Freeze the shop';
      break;
    case 'Reroll':
      actionDesc = 'Reroll the shop';
      break;
    case 'TierUp':
      actionDesc = `Tier up (cost: ${state.player.tierUpCost} gold)`;
      break;
    case 'Reposition':
      actionDesc = `Reposition minion from index ${action.fromIndex} to ${action.toIndex}`;
      break;
    default:
      actionDesc = 'Unknown action';
  }

  const systemMsg =
    "You are a Hearthstone Battlegrounds advisor. Explain the player's best move in one sentence.";

  const playerInfo = `Turn ${state.turn}, Tier ${state.player.tier}, HP ${state.player.hero.hp}, Gold ${state.player.gold}`;

  const opponentInfo = state.opponents
    .filter((o) => !o.eliminated)
    .map((o) => `Opponent ${o.playerId}: Tier ${o.tier}, HP ${o.hero.hp}`)
    .join('; ');

  const userContent = [
    `Current state: ${playerInfo}`,
    opponentInfo ? `Opponents: ${opponentInfo}` : 'No active opponents.',
    `Recommendation: ${actionDesc} (score: ${topRec.score}, confidence: ${topRec.confidence})`,
    topRec.reason ? `Reason: ${topRec.reason}` : undefined,
  ]
    .filter(Boolean)
    .join('\n');

  return [
    { role: 'system', content: systemMsg },
    { role: 'user', content: userContent },
  ];
}
