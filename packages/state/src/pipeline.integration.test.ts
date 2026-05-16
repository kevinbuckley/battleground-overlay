import { describe, expect, it } from 'bun:test';
import { createPipeline } from './pipeline';

function tagChange(
  entity: string,
  tag: string,
  value: string,
): import('@overlay/log-parser').TagChange {
  return { kind: 'TAG_CHANGE', entity, tag, value };
}

function blockStart(
  blockType: string,
  effectCardId: string,
  entity: string,
): import('@overlay/log-parser').BlockStart {
  return {
    kind: 'BLOCK_START',
    blockType,
    entity,
    effectCardId,
    effectIndex: 0,
    target: '',
    subOption: '',
    triggerKeyword: '',
  };
}

describe('pipeline integration', () => {
  it('replays synthetic events: start game + health + gold', () => {
    const pipeline = createPipeline();

    pipeline.onEvent({
      kind: 'PLAYER_INFO',
      entityId: 17,
      playerId: 6,
      isLocal: true,
    });

    // Start the game
    pipeline.onEvent(blockStart('TRIGGER', 'TB_BaconShop_StartGame', '1'));

    // Set player health.
    pipeline.onEvent(tagChange('17', 'HEALTH', '40'));

    // Set player gold.
    pipeline.onEvent(tagChange('17', 'RESOURCES', '3'));

    const state = pipeline.getState();

    expect(state.turn).toBe(1);
    expect(state.player.gold).toBe(3);
  });

  it('replays shopping-phase events: step + gold + tier', () => {
    const pipeline = createPipeline();

    // Start the game
    pipeline.onEvent(blockStart('TRIGGER', 'TB_BaconShop_StartGame', '1'));

    // Set player health
    pipeline.onEvent(tagChange('0', 'HEALTH', '40'));

    // Fire MAIN_READY step (enters shopping phase)
    pipeline.onEvent(tagChange('0', 'STEP', 'MAIN_READY'));

    // Set gold
    pipeline.onEvent(tagChange('0', 'RESOURCES', '4'));

    // Set tier
    pipeline.onEvent(tagChange('0', 'PLAYER_TECH_LEVEL', '2'));

    const state = pipeline.getState();

    expect(state.phase).toBe('shopping');
    expect(state.player.gold).toBe(4);
    expect(state.player.tier).toBe(2);
  });

  it('shop-buy → board-add flow: FULL_ENTITY + CONTROLLER + ZONE=PLAY', () => {
    const pipeline = createPipeline();

    pipeline.onEvent({
      kind: 'PLAYER_INFO',
      entityId: 17,
      playerId: 6,
      isLocal: true,
    });

    // Start the game
    pipeline.onEvent(blockStart('TRIGGER', 'TB_BaconShop_StartGame', '1'));

    // Create entity 200 in the system
    pipeline.onEvent({
      kind: 'FULL_ENTITY',
      id: 200,
      cardId: 'BG_TEST_MINION',
    } as import('@overlay/log-parser').FullEntity);

    // Assign controller to player
    pipeline.onEvent(tagChange('200', 'CONTROLLER', '6'));

    // Move entity to PLAY zone (shop buy)
    pipeline.onEvent({
      ...tagChange('200', 'ZONE', 'PLAY'),
      entityRaw: '[entityName=Minion id=200 zone=HAND zonePos=1 cardId=BG_TEST_MINION player=6]',
    });

    const state = pipeline.getState();

    expect(state.player.board.minions).toHaveLength(1);
    expect(state.player.board.minions[0]?.entityId).toBe(200);
    expect(state.player.board.minions[0]?.cardId).toBe('BG_TEST_MINION');
  });
});
