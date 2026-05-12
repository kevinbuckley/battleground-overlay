import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { HotkeyConfig } from './hotkeys';

export type OverlaySettings = {
  opacity: number;
  x: number;
  y: number;
  hotkeys: HotkeyConfig;
};

export function defaultSettings(): OverlaySettings {
  return {
    opacity: 0.85,
    x: 0,
    y: 0,
    hotkeys: { toggle: 'Alt+B', reload: 'Alt+R', hide: 'Alt+H' },
  };
}

const SETTINGS_FILENAME = 'overlay-settings.json';

export function loadSettings(path: string): OverlaySettings {
  const filePath = path.endsWith(SETTINGS_FILENAME) ? path : join(path, SETTINGS_FILENAME);

  if (!existsSync(filePath)) {
    return defaultSettings();
  }

  const raw = readFileSync(filePath, 'utf-8');
  const parsed = JSON.parse(raw) as Partial<OverlaySettings>;

  return {
    opacity: parsed.opacity ?? defaultSettings().opacity,
    x: parsed.x ?? defaultSettings().x,
    y: parsed.y ?? defaultSettings().y,
    hotkeys: {
      toggle: parsed.hotkeys?.toggle ?? defaultSettings().hotkeys.toggle,
      reload: parsed.hotkeys?.reload ?? defaultSettings().hotkeys.reload,
      hide: parsed.hotkeys?.hide ?? defaultSettings().hotkeys.hide,
    },
  };
}

export function saveSettings(path: string, s: OverlaySettings): void {
  const filePath = path.endsWith(SETTINGS_FILENAME) ? path : join(path, SETTINGS_FILENAME);

  writeFileSync(filePath, JSON.stringify(s, null, 2), 'utf-8');
}
