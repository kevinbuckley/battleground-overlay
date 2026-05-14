import { describe, expect, it } from 'bun:test';
import { runDoctor } from './doctor';

describe('runDoctor', () => {
  it('returns all-true when all deps succeed', async () => {
    const result = await runDoctor({
      isHsRunning: () => true,
      verifyConfig: () => ({ ok: true, missingSections: [] }),
      checkMlx: () => Promise.resolve({ ok: true }),
    });
    expect(result.hsRunning).toBe(true);
    expect(result.configOk).toBe(true);
    expect(result.mlxOk).toBe(true);
    expect(result.missingSections).toEqual([]);
    expect(result.mlxError).toBeUndefined();
  });

  it('returns hsRunning=false when isHsRunning returns false', async () => {
    const result = await runDoctor({
      isHsRunning: () => false,
      verifyConfig: () => ({ ok: true, missingSections: [] }),
      checkMlx: () => Promise.resolve({ ok: true }),
    });
    expect(result.hsRunning).toBe(false);
    expect(result.configOk).toBe(true);
    expect(result.mlxOk).toBe(true);
  });

  it('returns configOk=false with missingSections when verifyConfig fails', async () => {
    const result = await runDoctor({
      isHsRunning: () => true,
      verifyConfig: () => ({
        ok: false,
        missingSections: ['Zone', 'Bob'],
      }),
      checkMlx: () => Promise.resolve({ ok: true }),
    });
    expect(result.configOk).toBe(false);
    expect(result.missingSections).toEqual(['Zone', 'Bob']);
    expect(result.missingSections.length).toBeGreaterThan(0);
  });
});
