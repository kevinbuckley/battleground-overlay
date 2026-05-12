import type { Recommendation } from '@overlay/shared';

let currentAdvice: Recommendation | null = null;

export function setAdvice(rec: Recommendation | null): void {
  currentAdvice = rec;
}

export function getAdvice(): Recommendation | null {
  return currentAdvice;
}

export function clearAdvice(): void {
  currentAdvice = null;
}
