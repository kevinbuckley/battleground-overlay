export async function checkMlxServer(
  fetchFn: typeof fetch = fetch,
  url = 'http://localhost:8080/v1/models',
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetchFn(url);
    if (res.ok) {
      return { ok: true };
    }
    return { ok: false, error: `status ${res.status}` };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
