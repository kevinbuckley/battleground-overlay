export function withBudget<T>(fn: () => T, _ms: number, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}
