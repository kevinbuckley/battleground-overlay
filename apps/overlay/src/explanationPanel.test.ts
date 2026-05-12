import { describe, expect, it } from 'bun:test';
import { clearExplanation, getExplanation, setExplanation } from './explanationPanel';

describe('explanationPanel', () => {
  it('getExplanation returns null when no explanation is set', () => {
    clearExplanation();
    expect(getExplanation()).toBeNull();
  });

  it('setExplanation stores the text', () => {
    clearExplanation();
    setExplanation('Buy the 1/1 Taunt Dragon for triple synergy.');
    expect(getExplanation()).toBe('Buy the 1/1 Taunt Dragon for triple synergy.');
  });

  it('setExplanation with empty string clears', () => {
    clearExplanation();
    setExplanation('some explanation');
    expect(getExplanation()).not.toBeNull();
    setExplanation('');
    expect(getExplanation()).toBeNull();
  });

  it('clearExplanation resets to null', () => {
    clearExplanation();
    setExplanation('another explanation');
    expect(getExplanation()).not.toBeNull();
    clearExplanation();
    expect(getExplanation()).toBeNull();
  });
});
