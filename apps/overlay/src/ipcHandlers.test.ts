import { describe, expect, it } from 'bun:test';
import { registerIpcHandlers } from './ipcHandlers';

describe('registerIpcHandlers', () => {
  it('registers exactly 6 channels', () => {
    const channels: string[] = [];
    const fakeIpc = {
      handle: (channel: string, _cb: (...args: unknown[]) => unknown) => {
        channels.push(channel);
      },
    };
    const fakePanels = {
      setAdvice: (() => {}) as typeof import('./advicePanel').setAdvice,
      setExplanation: (() => {}) as typeof import('./explanationPanel').setExplanation,
      setBoardPanel: (() => {}) as typeof import('@overlay/shared').setBoardPanel,
      setOpponentPanel: (() => {}) as typeof import('@overlay/shared').setOpponentPanel,
      setInteractive: (() => {}) as typeof import('./overlayState').setInteractive,
    };
    const fakeSettings = {
      loadSettings: (() => ({
        opacity: 0.85,
        x: 0,
        y: 0,
        hotkeys: { toggle: 'Alt+B', reload: 'Alt+R', hide: 'Alt+H' },
      })) as typeof import('./settings').loadSettings,
    };

    registerIpcHandlers(fakeIpc, { settings: fakeSettings, panels: fakePanels });

    expect(channels).toEqual([
      'set-interactive',
      'set-advice',
      'set-explanation',
      'set-board-panel',
      'set-opponent-panel',
      'settings:apply',
    ]);
  });

  it('invoking set-interactive handler calls setInteractive(true)', () => {
    let calledWith: boolean | null = null;
    const fakeIpc = {
      handle: (channel: string, cb: (...args: unknown[]) => unknown) => {
        if (channel === 'set-interactive') {
          (cb as (...args: unknown[]) => unknown)(null, true);
        }
      },
    };
    const fakePanels = {
      setAdvice: (() => {}) as typeof import('./advicePanel').setAdvice,
      setExplanation: (() => {}) as typeof import('./explanationPanel').setExplanation,
      setBoardPanel: (() => {}) as typeof import('@overlay/shared').setBoardPanel,
      setOpponentPanel: (() => {}) as typeof import('@overlay/shared').setOpponentPanel,
      setInteractive: ((v: boolean) => {
        calledWith = v;
      }) as typeof import('./overlayState').setInteractive,
    };
    const fakeSettings = {
      loadSettings: (() => ({
        opacity: 0.85,
        x: 0,
        y: 0,
        hotkeys: { toggle: 'Alt+B', reload: 'Alt+R', hide: 'Alt+H' },
      })) as typeof import('./settings').loadSettings,
    };

    registerIpcHandlers(fakeIpc, { settings: fakeSettings, panels: fakePanels });

    expect(calledWith).toBe(true);
  });

  it('invoking set-advice handler calls setAdvice once', () => {
    let callCount = 0;
    let receivedArg: unknown = null;
    const fakeIpc = {
      handle: (channel: string, cb: (...args: unknown[]) => unknown) => {
        if (channel === 'set-advice') {
          (cb as (...args: unknown[]) => unknown)(null, {
            action: { type: 'Buy', cardId: 'test' },
            score: 0.5,
            confidence: 0.5,
            reason: '',
          });
        }
      },
    };
    const fakePanels = {
      setAdvice: ((rec: unknown) => {
        callCount++;
        receivedArg = rec;
      }) as typeof import('./advicePanel').setAdvice,
      setExplanation: (() => {}) as typeof import('./explanationPanel').setExplanation,
      setBoardPanel: (() => {}) as typeof import('@overlay/shared').setBoardPanel,
      setOpponentPanel: (() => {}) as typeof import('@overlay/shared').setOpponentPanel,
      setInteractive: (() => {}) as typeof import('./overlayState').setInteractive,
    };
    const fakeSettings = {
      loadSettings: (() => ({
        opacity: 0.85,
        x: 0,
        y: 0,
        hotkeys: { toggle: 'Alt+B', reload: 'Alt+R', hide: 'Alt+H' },
      })) as typeof import('./settings').loadSettings,
    };

    registerIpcHandlers(fakeIpc, { settings: fakeSettings, panels: fakePanels });

    expect(callCount).toBe(1);
    expect(receivedArg).toEqual({
      action: { type: 'Buy', cardId: 'test' },
      score: 0.5,
      confidence: 0.5,
      reason: '',
    });
  });
});
