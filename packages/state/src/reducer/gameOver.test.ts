import { describe, expect, it } from 'bun:test';
import type { TagChange } from '@overlay/log-parser';
import type { GameState } from '@overlay/shared';
import { initialState } from '../initialState';
import { applyGameOver } from './gameOver';

function makeEvent(value: string): TagChange {
  return { kind: 'TAG_CHANGE', entity: '0', tag: 'PLAYSTATE', value };
}

describe('applyGameOver', () => {
  it('sets phase to end when PLAYSTATE=FINISHED', () => {
    const state = { ...initialState(), phase: 'shopping' as GameState['phase'] };
    const result = applyGameOver(state, makeEvent('FINISHED'));
    expect(result.phase).toBe('end');
  });

  it('is no-op when PLAYSTATE is not FINISHED', () => {
    const state = initialState();
    const result = applyGameOver(state, makeEvent('PLAYING'));
    expect(result).toBe(state);
  });

  it('is no-op when tag is not PLAYSTATE', () => {
    const state = initialState();
    const event: TagChange = {
      kind: 'TAG_CHANGE',
      entity: '0',
      tag: 'HEALTH',
      value: '30',
    };
    const result = applyGameOver(state, event);
    expect(result).toBe(state);
  });
});
