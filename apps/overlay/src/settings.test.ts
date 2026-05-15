import { describe, expect, it } from 'bun:test';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  type OverlaySettings,
  defaultSettings,
  getDefaultSettingsPath,
  loadSettings,
  mergeSettings,
  saveSettings,
} from './settings';

describe('settings', () => {
  let tmpDir: string;

  function setup(): string {
    tmpDir = mkdtempSync(join(tmpdir(), 'overlay-settings-'));
    return tmpDir;
  }

  function teardown(): void {
    if (tmpDir) {
      rmSync(tmpDir, { recursive: true, force: true });
    }
  }

  it('defaultSettings returns correct defaults', () => {
    const s = defaultSettings();
    expect(s).toEqual({
      opacity: 0.85,
      x: 0,
      y: 0,
      hotkeys: { toggle: 'Alt+B', reload: 'Alt+R', hide: 'Alt+H' },
    });
  });

  it('defaultSettings returns a new object each call', () => {
    const a = defaultSettings();
    const b = defaultSettings();
    expect(a).not.toBe(b);
  });

  it('loadSettings returns defaults when file does not exist', () => {
    const dir = setup();
    try {
      const s = loadSettings(dir);
      expect(s).toEqual(defaultSettings());
    } finally {
      teardown();
    }
  });

  it('loadSettings returns defaults when path points to non-existent file', () => {
    const s = loadSettings('/tmp/nonexistent-overlay-settings-xyz.json');
    expect(s).toEqual(defaultSettings());
  });

  it('saveSettings + loadSettings round-trip preserves all fields', () => {
    const dir = setup();
    try {
      const original: OverlaySettings = {
        opacity: 0.6,
        x: 100,
        y: 200,
        hotkeys: { toggle: 'Cmd+Shift+S', reload: 'Cmd+Shift+R', hide: 'Cmd+Shift+H' },
      };

      saveSettings(dir, original);
      const loaded = loadSettings(dir);

      expect(loaded).toEqual(original);
    } finally {
      teardown();
    }
  });

  it('loadSettings falls back to defaults for missing fields', () => {
    const dir = setup();
    try {
      const partialPath = join(dir, 'overlay-settings.json');
      writeFileSync(partialPath, JSON.stringify({ opacity: 0.9, x: 50 }), 'utf-8');

      const loaded = loadSettings(dir);

      expect(loaded.opacity).toBe(0.9);
      expect(loaded.x).toBe(50);
      expect(loaded.y).toBe(defaultSettings().y);
      expect(loaded.hotkeys).toEqual(defaultSettings().hotkeys);
    } finally {
      teardown();
    }
  });

  it('loadSettings returns defaults when file contains invalid JSON', () => {
    const dir = setup();
    try {
      const fullPath = join(dir, 'overlay-settings.json');
      writeFileSync(fullPath, '{invalid json}', 'utf-8');

      const loaded = loadSettings(dir);

      expect(loaded).toEqual(defaultSettings());
    } finally {
      teardown();
    }
  });

  it('loadSettings accepts a full file path ending with the filename', () => {
    const dir = setup();
    try {
      const fullPath = join(dir, 'overlay-settings.json');
      const original: OverlaySettings = {
        opacity: 1.0,
        x: 0,
        y: 0,
        hotkeys: { toggle: 'F1', reload: 'F2', hide: 'F3' },
      };

      saveSettings(fullPath, original);
      const loaded = loadSettings(fullPath);

      expect(loaded).toEqual(original);
    } finally {
      teardown();
    }
  });

  it('loadSettings returns defaults when path is an empty string', () => {
    const s = loadSettings('');
    expect(s).toEqual(defaultSettings());
  });

  it('getDefaultSettingsPath returns a path ending with overlay-settings.json', () => {
    const path = getDefaultSettingsPath(() => '/fake/home');
    expect(path.endsWith('overlay-settings.json')).toBe(true);
  });

  it('getDefaultSettingsPath with custom homedir returns path starting with that homedir', () => {
    const path = getDefaultSettingsPath(() => '/tmp/test');
    expect(path.startsWith('/tmp/test/')).toBe(true);
  });

  it('saveSettings creates parent directories when they do not exist', () => {
    const dir = setup();
    try {
      const nestedPath = join(dir, 'sub', 'sub2');
      const original: OverlaySettings = {
        opacity: 0.7,
        x: 50,
        y: 100,
        hotkeys: { toggle: 'F1', reload: 'F2', hide: 'F3' },
      };

      saveSettings(nestedPath, original);

      const loaded = loadSettings(nestedPath);
      expect(loaded).toEqual(original);
    } finally {
      teardown();
    }
  });

  it('saveSettings with nested subpath creates the file at the nested location', () => {
    const dir = setup();
    try {
      const nestedPath = join(dir, 'a', 'b', 'c');
      const original: OverlaySettings = defaultSettings();

      saveSettings(nestedPath, original);

      const fullPath = join(nestedPath, 'overlay-settings.json');
      expect(existsSync(fullPath)).toBe(true);
    } finally {
      teardown();
    }
  });

  it('mergeSettings with empty patch returns object equal to base', () => {
    const base: OverlaySettings = {
      opacity: 0.7,
      x: 100,
      y: 200,
      hotkeys: { toggle: 'F1', reload: 'F2', hide: 'F3' },
    };

    const result = mergeSettings(base, {});

    expect(result).toEqual(base);
  });

  it('mergeSettings with partial opacity overrides only opacity', () => {
    const base: OverlaySettings = {
      opacity: 0.85,
      x: 0,
      y: 0,
      hotkeys: { toggle: 'Alt+B', reload: 'Alt+R', hide: 'Alt+H' },
    };

    const result = mergeSettings(base, { opacity: 0.5 });

    expect(result.opacity).toBe(0.5);
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
    expect(result.hotkeys).toEqual(defaultSettings().hotkeys);
  });

  it('mergeSettings with partial hotkeys overrides only the specified hotkey', () => {
    const base: OverlaySettings = {
      opacity: 0.85,
      x: 0,
      y: 0,
      hotkeys: { toggle: 'Alt+B', reload: 'Alt+R', hide: 'Alt+H' },
    };

    const result = mergeSettings(base, { hotkeys: { toggle: 'F1' } });

    expect(result.hotkeys.toggle).toBe('F1');
    expect(result.hotkeys.reload).toBe('Alt+R');
    expect(result.hotkeys.hide).toBe('Alt+H');
  });
});
