import { resolve } from 'node:path';
import { Worker } from 'node:worker_threads';
import type { BgsBoardInfo } from '@firestone-hs/simulate-bgs-battle/dist/bgs-board-info';
import type { BatchResult } from './index';

export interface WorkerPool {
  submitBatch(
    playerBoard: BgsBoardInfo,
    opponentBoard: BgsBoardInfo,
    n: number,
    seed?: number,
  ): Promise<BatchResult>;
  close(): void;
}

export function createWorkerPool(size: number): WorkerPool {
  const workers: Worker[] = [];
  let nextIndex = 0;

  for (let i = 0; i < size; i++) {
    const worker = new Worker(resolve(__dirname, 'workerThread.ts'));
    workers.push(worker);
  }

  function submitBatch(
    playerBoard: BgsBoardInfo,
    opponentBoard: BgsBoardInfo,
    n: number,
    seed?: number,
  ): Promise<BatchResult> {
    const worker = workers[nextIndex % size];
    nextIndex++;

    return new Promise<BatchResult>((resolve, reject) => {
      if (!worker) {
        reject(new Error('Worker not found'));
        return;
      }
      worker.on('message', (msg: BatchResult) => {
        resolve(msg);
      });
      worker.on('error', reject);
      worker.postMessage({ playerBoard, opponentBoard, n, seed });
    });
  }

  function close(): void {
    for (const worker of workers) {
      worker.terminate();
    }
  }

  return { submitBatch, close };
}
