// The only public origin allowed to call the API: scheme and host, no path, no wildcard.
export const PRODUCTION_ORIGIN = 'https://webmasterfed.github.io';

// DEV_ORIGINS may add local development origins only, e.g. "http://localhost:5173".
const LOCAL_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1):\d{1,5}$/;

export function buildAllowedOrigins(devOrigins: string | undefined): Set<string> {
  const localOrigins = (devOrigins ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => LOCAL_ORIGIN.test(origin));
  return new Set([PRODUCTION_ORIGIN, ...localOrigins]);
}

// Only ever echoes back an origin that was already checked against the allowlist.
export function corsHeaders(allowedOrigin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}
