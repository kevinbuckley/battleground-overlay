export interface BatchResult {
  wins: number;
  losses: number;
  ties: number;
}

export { toFirestoneBoard } from './adapter';
export { fromFirestoneTranscript } from './fromTranscript';
export type { Transcript } from './fromTranscript';
export { simulateBatch } from './simulateBatch';
