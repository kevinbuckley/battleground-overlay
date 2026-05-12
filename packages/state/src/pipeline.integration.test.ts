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
});
