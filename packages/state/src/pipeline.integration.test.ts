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

    // Start the game
    pipeline.onEvent(blockStart('TRIGGER', 'TB_BaconShop_StartGame', '1'));

    // Set player health (entity '0' matches player.entityId)
    pipeline.onEvent(tagChange('0', 'HEALTH', '40'));

    // Set player gold (entity '0' matches player.entityId)
    pipeline.onEvent(tagChange('0', 'RESOURCES', '3'));

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
});
