import type { IpcRenderer, contextBridge } from 'electron';

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
  });
}
