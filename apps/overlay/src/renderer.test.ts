import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('renderer.html', () => {
  it('contains required UI elements', () => {
    const htmlPath = resolve(__dirname, 'renderer.html');
    const html = readFileSync(htmlPath, 'utf8');
    expect(html).toContain('id="advice-action"');
    expect(html).toContain('id="advice-reason"');
    expect(html).toContain('id="explanation"');
  });

  it('references renderer-bundle.js', () => {
    const htmlPath = resolve(__dirname, 'renderer.html');
    const html = readFileSync(htmlPath, 'utf8');
    expect(html).toContain('src="./renderer-bundle.js"');
  });
});
