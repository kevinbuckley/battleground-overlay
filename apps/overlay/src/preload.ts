import type { IpcRenderer, contextBridge } from 'electron';

// Resolved at runtime via the preload's CJS require. Guarded so tests (which
// import this file directly without Electron available) don't crash.
let realContextBridge: typeof contextBridge | undefined;
let realIpcRenderer: IpcRenderer | undefined;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const electron = require('electron') as {
    contextBridge: typeof contextBridge;
    ipcRenderer: IpcRenderer;
  };
  realContextBridge = electron.contextBridge;
  realIpcRenderer = electron.ipcRenderer;
} catch {
  // not in an Electron preload context (e.g. unit test) — leave undefined
}

export function setupPreload(cb: typeof contextBridge, ipc: IpcRenderer): void {
  cb.exposeInMainWorld('overlayBridge', {
    onRecs(cb: (r: unknown[]) => void): void {
      ipc.on('overlay:recs-update', (_event, recs) => {
        cb(recs);
      });
    },
    onExplanation(cb: (t: string) => void): void {
      ipc.on('overlay:explanation-update', (_event, text) => {
        cb(text);
      });
    },
    onDamage(cb: (f: unknown) => void): void {
      ipc.on('overlay:damage-update', (_event, forecast) => {
        cb(forecast);
      });
    },
    onBoard(cb: (b: unknown) => void): void {
      ipc.on('overlay:board-update', (_event, board) => {
        cb(board);
      });
    },
    onShop(cb: (s: unknown[]) => void): void {
      ipc.on('overlay:shop-update', (_event, shop) => {
        cb(shop);
      });
    },
    onOpponents(cb: (o: unknown[]) => void): void {
      ipc.on('overlay:opponents-update', (_event, opponents) => {
        cb(opponents);
      });
    },
    onHsStatus(cb: (s: string) => void): void {
      ipc.on('overlay:hs-status', (_event, status) => {
        cb(status);
      });
    },
    onState(cb: (s: unknown) => void): void {
      ipc.on('overlay:state-update', (_event, state) => {
        cb(state);
      });
    },
    onStartupBanner(cb: (s: string) => void): void {
      ipc.on('overlay:startup-banner', (_event, banner) => {
        cb(banner);
      });
    },
  });
}

// Wire the bridge when this preload script is actually loaded into a renderer.
// Tests import setupPreload directly and stub electron, so guard against it.
if (typeof realContextBridge !== 'undefined' && typeof realIpcRenderer !== 'undefined') {
  setupPreload(realContextBridge, realIpcRenderer);
}
