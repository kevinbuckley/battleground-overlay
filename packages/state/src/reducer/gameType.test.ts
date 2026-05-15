import { describe, expect, it } from 'bun:test';
import type { TagChange } from '@overlay/log-parser';
import { initialState } from '../initialState';
import { applyGameType } from './gameType';

describe('applyGameType', () => {
  it('sets gameType on GAME_TYPE tag for player', () => {
    const state = initialState();
    const event: TagChange = {
      kind: 'TAG_CHANGE',
      entity: String(state.player.entityId),
      tag: 'GAME_TYPE',
      value: 'BATTLEGROUNDS',
    };
    const result = applyGameType(state, event);
    expect(result.player.gameType).toBe('BATTLEGROUNDS');
  });

  it('sets gameType to null when value is "0"', () => {
    const state = initialState();
    const event: TagChange = {
      kind: 'TAG_CHANGE',
      entity: String(state.player.entityId),
      tag: 'GAME_TYPE',
      value: '0',
    };
    const result = applyGameType(state, event);
    expect(result.player.gameType).toBeNull();
  });

  it('is no-op on opponent entity', () => {
    const state = initialState();
    const event: TagChange = {
      kind: 'TAG_CHANGE',
      entity: '999',
      tag: 'GAME_TYPE',
      value: 'BATTLEGROUNDS_DRAFT',
    };
    const result = applyGameType(state, event);
    expect(result.player.gameType).toBeNull();
  });

  it('is no-op on non-GAME_TYPE tag', () => {
    const state = initialState();
    const event: TagChange = {
      kind: 'TAG_CHANGE',
      entity: String(state.player.entityId),
      tag: 'HEALTH',
      value: '30',
    };
    const result = applyGameType(state, event);
    expect(result.player.gameType).toBeNull();
  });
});
