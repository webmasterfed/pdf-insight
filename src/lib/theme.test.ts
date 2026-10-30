import { describe, expect, it } from 'vitest';
import type { KeyValueStorage } from './storage.ts';
import { applyThemeMode, loadThemeMode, saveThemeMode, THEME_KEY } from './theme.ts';

function memoryStorage(initial: Record<string, string> = {}): KeyValueStorage {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
    removeItem: (key) => {
      data.delete(key);
    },
  };
}

describe('theme mode', () => {
  it('defaults to following the system', () => {
    expect(loadThemeMode(memoryStorage())).toBe('system');
    expect(loadThemeMode(null)).toBe('system');
  });

  it('remembers a saved choice', () => {
    const storage = memoryStorage();
    saveThemeMode(storage, 'dark');
    expect(loadThemeMode(storage)).toBe('dark');
  });

  it('ignores unknown stored values', () => {
    expect(loadThemeMode(memoryStorage({ [THEME_KEY]: 'purple' }))).toBe('system');
  });

  it('does not throw when storage is blocked', () => {
    const blocked: KeyValueStorage = {
      getItem: () => {
        throw new Error('SecurityError');
      },
      setItem: () => {
        throw new Error('SecurityError');
      },
      removeItem: () => undefined,
    };
    expect(loadThemeMode(blocked)).toBe('system');
    expect(() => {
      saveThemeMode(blocked, 'light');
    }).not.toThrow();
  });

  it('sets data-theme for light and dark and removes it for system', () => {
    const root = { dataset: {} as DOMStringMap };
    applyThemeMode('dark', root);
    expect(root.dataset.theme).toBe('dark');
    applyThemeMode('system', root);
    expect(root.dataset.theme).toBeUndefined();
  });
});
