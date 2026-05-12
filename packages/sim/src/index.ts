export interface BatchResult {
  wins: number;
  losses: number;
  ties: number;
}

export type { BenchResult } from './bench';
export { Benchmark, compareBenchmarks } from './bench';
export { toFirestoneBoard } from './adapter';
export { fromFirestoneTranscript } from './fromTranscript';
export type { Transcript } from './fromTranscript';
export { simulateBatch } from './simulateBatch';
export { createWorkerPool } from './worker';
export type { WorkerPool } from './worker';
