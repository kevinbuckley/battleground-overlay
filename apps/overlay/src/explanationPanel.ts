let currentExplanation: string | null = null;

export function setExplanation(text: string): void {
  currentExplanation = text || null;
}

export function getExplanation(): string | null {
  return currentExplanation;
}

export function clearExplanation(): void {
  currentExplanation = null;
}
