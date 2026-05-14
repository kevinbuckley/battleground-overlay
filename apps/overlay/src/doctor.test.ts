import { describe, expect, it } from 'bun:test';
import { formatDoctorReport, runDoctor } from './doctor';

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

  describe('formatDoctorReport', () => {
    it('all-ok report contains 3 checkmarks', async () => {
      const result = await runDoctor({
        isHsRunning: () => true,
        verifyConfig: () => ({ ok: true, missingSections: [] }),
        checkMlx: () => Promise.resolve({ ok: true }),
      });
      const report = formatDoctorReport(result);
      const checkCount = (report.match(/✓/g) || []).length;
      expect(checkCount).toBe(3);
    });

    it('one failure contains 2 checkmarks and 1 cross', async () => {
      const result = await runDoctor({
        isHsRunning: () => false,
        verifyConfig: () => ({ ok: true, missingSections: [] }),
        checkMlx: () => Promise.resolve({ ok: true }),
      });
      const report = formatDoctorReport(result);
      const checkCount = (report.match(/✓/g) || []).length;
      const crossCount = (report.match(/✗/g) || []).length;
      expect(checkCount).toBe(2);
      expect(crossCount).toBe(1);
    });

    it('missing sections list appears after config line when configOk=false', async () => {
      const result = await runDoctor({
        isHsRunning: () => true,
        verifyConfig: () => ({
          ok: false,
          missingSections: ['Zone', 'Bob'],
        }),
        checkMlx: () => Promise.resolve({ ok: true }),
      });
      const report = formatDoctorReport(result);
      expect(report).toContain('Missing: Zone, Bob');
    });
  });
});
