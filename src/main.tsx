import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import './index.css';
import './theme-dark.css';
import { getBrowserStorage } from './lib/storage.ts';
import { applyThemeMode, loadThemeMode } from './lib/theme.ts';

// Applied before the first render so a saved theme never flashes the other one.
applyThemeMode(loadThemeMode(getBrowserStorage()), document.documentElement);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
