import { useState } from 'react';
import { getBrowserStorage } from '../lib/storage.ts';
import { applyThemeMode, loadThemeMode, saveThemeMode, type ThemeMode } from '../lib/theme.ts';

const storage = getBrowserStorage();

const OPTIONS: { mode: ThemeMode; label: string }[] = [
  { mode: 'system', label: 'Auto' },
  { mode: 'light', label: 'Jasny' },
  { mode: 'dark', label: 'Ciemny' },
];

// Native radio buttons in a fieldset: the browser provides the keyboard behaviour
// (Tab into the group, arrow keys to change) and screen readers announce "Motyw, 1 of 3".
export function ThemeSwitch() {
  const [mode, setMode] = useState<ThemeMode>(() => loadThemeMode(storage));

  function choose(next: ThemeMode) {
    setMode(next);
    applyThemeMode(next, document.documentElement);
    saveThemeMode(storage, next);
  }

  return (
    <fieldset className="theme-switch">
      <legend className="visually-hidden">Motyw</legend>
      {OPTIONS.map((option) => (
        <label key={option.mode} className="theme-switch__option">
          <input
            className="visually-hidden"
            type="radio"
            name="theme"
            value={option.mode}
            checked={mode === option.mode}
            onChange={() => {
              choose(option.mode);
            }}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </fieldset>
  );
}
