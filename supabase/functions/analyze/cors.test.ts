import { describe, expect, it } from 'vitest';
import { buildAllowedOrigins, PRODUCTION_ORIGIN } from './cors.ts';

describe('buildAllowedOrigins', () => {
  it('allows only the GitHub Pages origin when DEV_ORIGINS is not set', () => {
    expect([...buildAllowedOrigins(undefined)]).toEqual(['https://webmasterfed.github.io']);
  });

  it('adds local development origins from DEV_ORIGINS', () => {
    const origins = buildAllowedOrigins('http://localhost:5173, http://127.0.0.1:4173');
    expect([...origins]).toEqual([
      PRODUCTION_ORIGIN,
      'http://localhost:5173',
      'http://127.0.0.1:4173',
    ]);
  });

  it.each([
    '*',
    'https://evil.example',
    'https://webmasterfed.github.io.evil.example',
    'http://localhost:5173/path',
    'https://localhost:5173',
  ])('ignores %s in DEV_ORIGINS', (origin) => {
    expect([...buildAllowedOrigins(origin)]).toEqual([PRODUCTION_ORIGIN]);
  });

  it('does not match origins with a path or a different scheme', () => {
    const origins = buildAllowedOrigins(undefined);
    expect(origins.has('https://webmasterfed.github.io/pdf-insight')).toBe(false);
    expect(origins.has('http://webmasterfed.github.io')).toBe(false);
  });
});
