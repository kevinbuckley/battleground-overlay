import { copyFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import * as esbuild from 'esbuild';

const ROOT = resolve(import.meta.dirname);
const SRC = join(ROOT, 'src');
const DIST = join(ROOT, 'dist');

async function build() {
  mkdirSync(DIST, { recursive: true });

  // Bundle main.ts → dist/main.cjs (CommonJS for Electron)
  await esbuild.build({
    entryPoints: [join(SRC, 'main.ts')],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: ['node20'],
    outfile: join(DIST, 'main.cjs'),
    external: ['electron'],
    define: { 'import.meta.dirname': '__dirname', 'import.meta.url': '__filename' },
    logLevel: 'info',
  });

  // Bundle preload.ts → dist/preload.js (CJS so require('electron') works in
  // the preload context with contextIsolation enabled).
  await esbuild.build({
    entryPoints: [join(SRC, 'preload.ts')],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: ['node20'],
    outfile: join(DIST, 'preload.js'),
    external: ['electron'],
    logLevel: 'info',
  });

  // Bundle renderer.ts → dist/renderer-bundle.js (browser IIFE)
  await esbuild.build({
    entryPoints: [join(SRC, 'renderer.ts')],
    bundle: true,
    platform: 'browser',
    format: 'iife',
    target: 'esnext',
    outfile: join(DIST, 'renderer-bundle.js'),
    logLevel: 'info',
  });

  // Copy renderer.html → dist/
  copyFileSync(join(SRC, 'renderer.html'), join(DIST, 'renderer.html'));

  console.log(
    'Build complete: dist/main.cjs, dist/preload.js, dist/renderer-bundle.js, dist/renderer.html',
  );
}

build().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
