import type { KeyValueStorage } from './storage.ts';

export const THEME_KEY = 'pdf-insight:theme';

// "system" follows the operating system (prefers-color-scheme); the others override it.
export const THEME_MODES = ['system', 'light', 'dark'] as const;
export type ThemeMode = (typeof THEME_MODES)[number];

function isThemeMode(value: string | null): value is ThemeMode {
  return THEME_MODES.some((mode) => mode === value);
}

export function loadThemeMode(storage: KeyValueStorage | null): ThemeMode {
  try {
    const stored = storage?.getItem(THEME_KEY) ?? null;
    return isThemeMode(stored) ? stored : 'system';
  } catch {
    return 'system';
  }
}

export function saveThemeMode(storage: KeyValueStorage | null, mode: ThemeMode): void {
  try {
    storage?.setItem(THEME_KEY, mode);
  } catch {
    // The choice still applies for this visit; it is just not remembered.
  }
}

// The CSS reads data-theme on <html>: no attribute means "follow the system".
export function applyThemeMode(mode: ThemeMode, root: Pick<HTMLElement, 'dataset'>): void {
  if (mode === 'system') {
    delete root.dataset.theme;
  } else {
    root.dataset.theme = mode;
  }
}
