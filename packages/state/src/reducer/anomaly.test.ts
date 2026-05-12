import { describe, expect, it } from 'bun:test';
import type { HsEvent } from '@overlay/log-parser';
import { initialState } from '../initialState';
import { applyAnomaly } from './anomaly';

function tagChange(entity: string, tag: string, value: string): HsEvent {
  return { kind: 'TAG_CHANGE', entity, tag, value };
}

describe('applyAnomaly', () => {
  it('sets anomaly when ANOMALY tag changes on player with non-zero value', () => {
    const state = initialState();
    const event = tagChange('0', 'ANOMALY', 'TB_BaconBoss_13');
    const result = applyAnomaly(state, event);
    expect(result.anomaly).toBe('TB_BaconBoss_13');
  });

  it('clears anomaly when ANOMALY tag is 0', () => {
    const state = { ...initialState(), anomaly: 'TB_BaconBoss_13' };
    const event = tagChange('0', 'ANOMALY', '0');
    const result = applyAnomaly(state, event);
    expect(result.anomaly).toBe(null);
  });

  it('ignores ANOMALY tag on non-player entity', () => {
    const state = { ...initialState(), player: { ...initialState().player, entityId: 1 } };
    const event = tagChange('0', 'ANOMALY', 'TB_BaconBoss_13');
    const result = applyAnomaly(state, event);
    expect(result.anomaly).toBe(null);
  });

  it('ignores non-ANOMALY tags', () => {
    const state = initialState();
    const event = tagChange('0', 'HEALTH', '35');
    const result = applyAnomaly(state, event);
    expect(result.anomaly).toBe(null);
  });
});
