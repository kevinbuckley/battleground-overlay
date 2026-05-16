import { describe, expect, it } from 'bun:test';
import { initialState } from '../initialState';
import { applyTurnPhase } from './turnPhase';

function tagChange(
  tag: string,
  value: string,
): { kind: 'TAG_CHANGE'; entity: string; tag: string; value: string } {
  return { kind: 'TAG_CHANGE', entity: '16', tag, value };
}

describe('applyTurnPhase', () => {
  it('transitions MAIN_READY → shopping', () => {
    const state = initialState();
    const event = tagChange('STEP', 'MAIN_READY');
    const result = applyTurnPhase(state, event);
    expect(result.phase).toBe('shopping');
  });

  it('transitions BEGIN_SHOOTING_ATTACK → combat', () => {
    const state = initialState();
    const event = tagChange('STEP', 'BEGIN_SHOOTING_ATTACK');
    const result = applyTurnPhase(state, event);
    expect(result.phase).toBe('combat');
  });

  it('transitions MAIN_COMBAT → combat', () => {
    const state = initialState();
    const event = tagChange('STEP', 'MAIN_COMBAT');
    const result = applyTurnPhase(state, event);
    expect(result.phase).toBe('combat');
  });

  it('transitions FINAL_GAMEOVER → end', () => {
    const state = initialState();
    const event = tagChange('STEP', 'FINAL_GAMEOVER');
    const result = applyTurnPhase(state, event);
    expect(result.phase).toBe('end');
  });

  it('transitions MAIN_CLEANUP → end', () => {
    const state = initialState();
    const event = tagChange('STEP', 'MAIN_CLEANUP');
    const result = applyTurnPhase(state, event);
    expect(result.phase).toBe('end');
  });

  it('ignores unknown STEP values', () => {
    const state = initialState();
    const event = tagChange('STEP', 'UNKNOWN_STEP');
    const result = applyTurnPhase(state, event);
    expect(result.phase).toBe('lobby');
  });

  it('ignores non-STEP tag changes', () => {
    const state = initialState();
    const event = tagChange('HEALTH', '30');
    const result = applyTurnPhase(state, event);
    expect(result.phase).toBe('lobby');
  });

  it('does not increment turn on MAIN_READY', () => {
    const state = { ...initialState(), turn: 1 };
    const event = tagChange('STEP', 'MAIN_READY');
    const result = applyTurnPhase(state, event);
    expect(result.turn).toBe(1);
  });

  it('preserves StartGame turn when MAIN_READY fires again', () => {
    const state = { ...initialState(), turn: 1, phase: 'shopping' as const };
    const event = tagChange('STEP', 'MAIN_READY');
    const result = applyTurnPhase(state, event);
    expect(result.turn).toBe(1);
    expect(result.phase).toBe('shopping');
  });

  it('does not increment turn on non-MAIN_READY phases', () => {
    const state = { ...initialState(), turn: 3, phase: 'combat' as GameState['phase'] };
    const event = tagChange('STEP', 'BEGIN_SHOOTING_ATTACK');
    const result = applyTurnPhase(state, event);
    expect(result.turn).toBe(3);
    expect(result.phase).toBe('combat');
  });
});
