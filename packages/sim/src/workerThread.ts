import { Worker, parentPort, worker_threads } from 'node:worker_threads';
import type { BgsBoardInfo } from '@firestone-hs/simulate-bgs-battle/dist/bgs-board-info';
import { BatchResult } from './index';

interface WorkerMessage {
  playerBoard: BgsBoardInfo;
  opponentBoard: BgsBoardInfo;
  n: number;
  seed?: number;
}

if (parentPort) {
  parentPort.on('message', (msg: WorkerMessage) => {
    import('./simulateBatch').then(({ simulateBatch }) => {
      const result = simulateBatch(msg.playerBoard, msg.opponentBoard, msg.n, msg.seed);
      parentPort!.postMessage(result);
    });
  });
}
