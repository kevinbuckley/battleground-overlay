import { describe, expect, it } from 'bun:test';
import { setupPreload } from './preload';

function makeMockIpc() {
  const listeners: Record<string, ((...args: unknown[]) => void)[]> = {};
  return {
    on(channel: string, fn: (...args: unknown[]) => void) {
      if (!listeners[channel]) listeners[channel] = [];
      listeners[channel].push(fn);
    },
    _getListeners: () => listeners,
  };
}

function makeMockContextBridge() {
  let exposed: { name: string; value: unknown } | null = null;
  return {
    exposeInMainWorld(name: string, value: unknown) {
      exposed = { name, value };
    },
    _getExposed: () => exposed,
  };
}

describe('preload', () => {
  it('exposeInMainWorld is called with overlayBridge containing onRecs and onExplanation', () => {
    const mockIpc = makeMockIpc();
    const mockCb = makeMockContextBridge();

    setupPreload(
      mockCb as unknown as typeof import('electron').contextBridge,
      mockIpc as unknown as import('electron').IpcRenderer,
    );

    const exposed = mockCb._getExposed();
    expect(exposed).not.toBeNull();
    expect(exposed!.name).toBe('overlayBridge');
    const bridge = exposed!.value as {
      onRecs: (cb: (r: unknown[]) => void) => void;
      onExplanation: (cb: (t: string) => void) => void;
    };
    expect(typeof bridge.onRecs).toBe('function');
    expect(typeof bridge.onExplanation).toBe('function');
  });

  it('onRecs registers an ipc listener for overlay:recs-update when invoked', () => {
    const mockIpc = makeMockIpc();
    const mockCb = makeMockContextBridge();

    setupPreload(
      mockCb as unknown as typeof import('electron').contextBridge,
      mockIpc as unknown as import('electron').IpcRenderer,
    );

    const exposed = mockCb._getExposed();
    const bridge = exposed!.value as { onRecs: (cb: (r: unknown[]) => void) => void };
    bridge.onRecs(() => {});

    const listeners = mockIpc._getListeners();
    expect(listeners['overlay:recs-update']).toBeDefined();
    expect(listeners['overlay:recs-update'].length).toBe(1);
  });

  it('onExplanation registers an ipc listener for overlay:explanation-update when invoked', () => {
    const mockIpc = makeMockIpc();
    const mockCb = makeMockContextBridge();

    setupPreload(
      mockCb as unknown as typeof import('electron').contextBridge,
      mockIpc as unknown as import('electron').IpcRenderer,
    );

    const exposed = mockCb._getExposed();
    const bridge = exposed!.value as { onExplanation: (cb: (t: string) => void) => void };
    bridge.onExplanation(() => {});

    const listeners = mockIpc._getListeners();
    expect(listeners['overlay:explanation-update']).toBeDefined();
    expect(listeners['overlay:explanation-update'].length).toBe(1);
  });

  it('only expected channels are registered: state-update, board-update, opponents-update, damage-update, recs-update, explanation-update', () => {
    const mockIpc = makeMockIpc();
    const mockCb = makeMockContextBridge();

    setupPreload(
      mockCb as unknown as typeof import('electron').contextBridge,
      mockIpc as unknown as import('electron').IpcRenderer,
    );

    const exposed = mockCb._getExposed();
    const bridge = exposed!.value as {
      onRecs: (cb: (r: unknown[]) => void) => void;
      onExplanation: (cb: (t: string) => void) => void;
    };
    bridge.onRecs(() => {});
    bridge.onExplanation(() => {});

    const listeners = mockIpc._getListeners();
    const registeredChannels = Object.keys(listeners);
    const expectedChannels = ['overlay:recs-update', 'overlay:explanation-update'];
    expect(registeredChannels.sort()).toEqual(expectedChannels.sort());
  });

  it('onRecs and onExplanation callbacks are invoked when their channels fire', () => {
    const mockIpc = makeMockIpc();
    const mockCb = makeMockContextBridge();

    setupPreload(
      mockCb as unknown as typeof import('electron').contextBridge,
      mockIpc as unknown as import('electron').IpcRenderer,
    );

    const exposed = mockCb._getExposed();
    const bridge = exposed!.value as {
      onRecs: (cb: (r: unknown[]) => void) => void;
      onExplanation: (cb: (t: string) => void) => void;
    };

    let recsArg: unknown[] | null = null;
    let textArg: string | null = null;
    bridge.onRecs((r) => {
      recsArg = r;
    });
    bridge.onExplanation((t) => {
      textArg = t;
    });

    const listeners = mockIpc._getListeners();
    const recsListener = listeners['overlay:recs-update']?.[0];
    const explanationListener = listeners['overlay:explanation-update']?.[0];

    recsListener?.(null, [{ action: { type: 'Buy' }, score: 0.5 }]);
    explanationListener?.(null, 'This is a good play');

    expect(recsArg).toEqual([{ action: { type: 'Buy' }, score: 0.5 }]);
    expect(textArg).toBe('This is a good play');
  });

  it('onDamage callback fires with payload when overlay:damage-update channel fires', () => {
    const mockIpc = makeMockIpc();
    const mockCb = makeMockContextBridge();

    setupPreload(
      mockCb as unknown as typeof import('electron').contextBridge,
      mockIpc as unknown as import('electron').IpcRenderer,
    );

    const exposed = mockCb._getExposed();
    const bridge = exposed!.value as {
      onDamage: (cb: (f: unknown) => void) => void;
    };

    let damageArg: unknown = null;
    bridge.onDamage((f) => {
      damageArg = f;
    });

    const listeners = mockIpc._getListeners();
    const damageListener = listeners['overlay:damage-update']?.[0];

    const forecast = { minDmg: 5, maxDmg: 15, winPct: 0.7 };
    damageListener?.(null, forecast);

    expect(damageArg).toEqual(forecast);
  });

  it('onBoard callback fires with payload when overlay:board-update channel fires', () => {
    const mockIpc = makeMockIpc();
    const mockCb = makeMockContextBridge();

    setupPreload(
      mockCb as unknown as typeof import('electron').contextBridge,
      mockIpc as unknown as import('electron').IpcRenderer,
    );

    const exposed = mockCb._getExposed();
    const bridge = exposed!.value as {
      onBoard: (cb: (b: unknown) => void) => void;
    };

    let boardArg: unknown = null;
    bridge.onBoard((b) => {
      boardArg = b;
    });

    const listeners = mockIpc._getListeners();
    const boardListener = listeners['overlay:board-update']?.[0];

    const boardData = [
      { cardId: 'TB_GolBozhi_01', attack: 3, health: 2, taunt: false, divineShield: false },
    ];
    boardListener?.(null, boardData);

    expect(boardArg).toEqual(boardData);
  });

  it('onOpponents is exposed and fires with payload when overlay:opponents-update channel fires', () => {
    const mockIpc = makeMockIpc();
    const mockCb = makeMockContextBridge();

    setupPreload(
      mockCb as unknown as typeof import('electron').contextBridge,
      mockIpc as unknown as import('electron').IpcRenderer,
    );

    const exposed = mockCb._getExposed();
    const bridge = exposed!.value as {
      onOpponents: (cb: (o: unknown[]) => void) => void;
    };

    expect(typeof bridge.onOpponents).toBe('function');

    let opponentsArg: unknown[] | null = null;
    bridge.onOpponents((o) => {
      opponentsArg = o;
    });

    const listeners = mockIpc._getListeners();
    const opponentsListener = listeners['overlay:opponents-update']?.[0];

    const opponentsData = [
      { entityId: 1, hp: 30, tier: 3, eliminated: false },
      { entityId: 2, hp: 15, tier: 5, eliminated: false },
    ];
    opponentsListener?.(null, opponentsData);

    expect(opponentsArg).toEqual(opponentsData);
  });

  it('onHsStatus is exposed on the bridge object', () => {
    const mockIpc = makeMockIpc();
    const mockCb = makeMockContextBridge();

    setupPreload(
      mockCb as unknown as typeof import('electron').contextBridge,
      mockIpc as unknown as import('electron').IpcRenderer,
    );

    const exposed = mockCb._getExposed();
    const bridge = exposed!.value as {
      onHsStatus: (cb: (s: string) => void) => void;
    };

    expect(typeof bridge.onHsStatus).toBe('function');
  });

  it('onHsStatus callback fires with payload when overlay:hs-status channel fires', () => {
    const mockIpc = makeMockIpc();
    const mockCb = makeMockContextBridge();

    setupPreload(
      mockCb as unknown as typeof import('electron').contextBridge,
      mockIpc as unknown as import('electron').IpcRenderer,
    );

    const exposed = mockCb._getExposed();
    const bridge = exposed!.value as {
      onHsStatus: (cb: (s: string) => void) => void;
    };

    let statusArg: string | null = null;
    bridge.onHsStatus((s) => {
      statusArg = s;
    });

    const listeners = mockIpc._getListeners();
    const hsStatusListener = listeners['overlay:hs-status']?.[0];

    hsStatusListener?.(null, 'anchored');

    expect(statusArg).toBe('anchored');
  });
});
