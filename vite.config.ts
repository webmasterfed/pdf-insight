import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // GitHub Pages serves the app from https://webmasterfed.github.io/pdf-insight/,
  // so every asset URL must start with the repository name.
  base: '/pdf-insight/',
  plugins: [react()],
  test: {
    include: ['src/**/*.test.ts'],
  },
});
