import { describe, expect, it } from 'bun:test';
import { createPipeline } from './pipeline';

describe('createPipeline', () => {
  it('returns an object with onEvent, getState, and reset', () => {
    const p = createPipeline();
    expect(typeof p.onEvent).toBe('function');
    expect(typeof p.getState).toBe('function');
    expect(typeof p.reset).toBe('function');
  });

  it('getState returns initial state before any events', () => {
    const p = createPipeline();
    const s = p.getState();
    expect(s.turn).toBe(0);
    expect(s.phase).toBe('lobby');
    expect(s.player.tier).toBe(1);
    expect(s.player.hero.hp).toBe(40);
  });

  it('onEvent updates state via reducer — TAG_CHANGE HEALTH with matching entity 0', () => {
    const p = createPipeline();
    // initialState has player.hero.entityId = 0, player.entityId = 0
    p.onEvent({ kind: 'TAG_CHANGE', entity: '0', tag: 'HEALTH', value: '35' });
    expect(p.getState().player.hero.hp).toBe(35);
  });

  it('onEvent updates state via reducer — TAG_CHANGE RESOURCES with matching entity 0', () => {
    const p = createPipeline();
    p.onEvent({ kind: 'TAG_CHANGE', entity: '0', tag: 'RESOURCES', value: '5' });
    expect(p.getState().player.gold).toBe(5);
  });

  it('onEvent updates state via reducer — TAG_CHANGE PLAYER_TECH_LEVEL with matching entity 0', () => {
    const p = createPipeline();
    p.onEvent({ kind: 'TAG_CHANGE', entity: '0', tag: 'PLAYER_TECH_LEVEL', value: '3' });
    expect(p.getState().player.tier).toBe(3);
  });

  it('reset restores initial state', () => {
    const p = createPipeline();
    p.onEvent({ kind: 'TAG_CHANGE', entity: '0', tag: 'HEALTH', value: '35' });
    expect(p.getState().player.hero.hp).toBe(35);
    p.reset();
    expect(p.getState().player.hero.hp).toBe(40);
    expect(p.getState().turn).toBe(0);
  });
});
