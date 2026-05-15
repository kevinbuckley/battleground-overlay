import { describe, expect, it } from 'bun:test';

describe('scripts/doctor.ts', () => {
  it('imports cleanly and resolves as a module', async () => {
    const mod = await import('../scripts/doctor');
    // The script has no named exports — it just runs main() on import.
    // Verify the module resolves without throwing.
    expect(mod).toBeDefined();
  });
});
