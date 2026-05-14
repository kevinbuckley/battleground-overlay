import type { GameState, Recommendation } from '@overlay/shared';
import { appendSessionEvent } from '@overlay/shared';
import { buildExplainPrompt } from './buildPrompt';
import { LlmCache, hashState } from './cache';
import { chatCompletion } from './client';

const CACHE = new LlmCache();
const LLM_TIMEOUT_MS = 1000;

export { chatCompletion } from './client';
export { hashState, LlmCache } from './cache';
export { buildExplainPrompt } from './buildPrompt';
export { checkMlxServer } from './healthCheck';

export async function explain(rec: Recommendation, state: GameState): Promise<string> {
  const cacheKey = hashState(state);
  const cached = CACHE.get(state);
  if (cached !== undefined) {
    appendSessionEvent('llm_cache_hit', { cacheKey, rec });
    return cached;
  }

  appendSessionEvent('llm_cache_miss', { cacheKey });

  const messages = buildExplainPrompt(state, [rec]);

  const startTime = Date.now();
  let result: { text: string };
  try {
    result = await chatCompletion(messages, { timeoutMs: LLM_TIMEOUT_MS });
  } catch {
    result = { text: '' };
  }
  const elapsed = Date.now() - startTime;
  const timedOut = elapsed > LLM_TIMEOUT_MS;

  if (result.text && !timedOut) {
    CACHE.set(state, result.text);
  }

  appendSessionEvent('llm_round_trip', {
    cacheKey,
    rec,
    responseLength: result.text.length,
    timedOut,
  });

  return result.text;
}
