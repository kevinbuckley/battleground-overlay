export function withBudget<T>(fn: () => T, ms: number, fallback: T): T {
  const startTime = Date.now();
  let result: T | undefined;
  let timedOut = false;

  try {
    result = fn();
  } catch {
    return fallback;
  }

  const elapsed = Date.now() - startTime;
  if (elapsed > ms) {
    timedOut = true;
  }

  return timedOut ? fallback : (result as T);
}
