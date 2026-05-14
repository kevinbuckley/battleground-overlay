import { describe, expect, it } from 'bun:test';
import { verifyHsLoggingConfig } from './hsLogConfig';

describe('verifyHsLoggingConfig', () => {
  it('file with all 6 sections returns ok=true, missingSections=[]', () => {
    const content =
      '[Power]\nverbose=1\n[Zone]\nverbose=1\n[Bob]\nverbose=1\n[LoadingScreen]\nverbose=1\n[Asset]\nverbose=1\n[Net.Mgr]\nverbose=1\n';
    const result = verifyHsLoggingConfig('/fake/path', () => content);
    expect(result.ok).toBe(true);
    expect(result.missingSections).toEqual([]);
  });

  it('file missing [Zone] returns ok=false, missingSections=[Zone]', () => {
    const content =
      '[Power]\nverbose=1\n[Bob]\nverbose=1\n[LoadingScreen]\nverbose=1\n[Asset]\nverbose=1\n[Net.Mgr]\nverbose=1\n';
    const result = verifyHsLoggingConfig('/fake/path', () => content);
    expect(result.ok).toBe(false);
    expect(result.missingSections).toEqual(['Zone']);
  });

  it('file missing 3 sections returns missingSections.length===3', () => {
    const content = '[Power]\nverbose=1\n[Zone]\nverbose=1\n[Bob]\nverbose=1\n';
    const result = verifyHsLoggingConfig('/fake/path', () => content);
    expect(result.ok).toBe(false);
    expect(result.missingSections.length).toBe(3);
  });

  it('nonexistent file (readFn throws) returns ok=false and missingSections non-empty', () => {
    const result = verifyHsLoggingConfig('/nonexistent', () => {
      throw new Error('ENOENT');
    });
    expect(result.ok).toBe(false);
    expect(result.missingSections.length).toBeGreaterThan(0);
  });
});
