import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AnalysisApiError, requestAnalysis } from './analyze.ts';

const request = {
  text: 'Umowa serwisowa.',
  fileName: 'umowa.pdf',
  pages: 1,
  pagesWithoutText: [],
};

const validResult = {
  document: {
    fileName: 'umowa.pdf',
    pages: 1,
    language: 'pl',
    type: 'umowa',
    title: null,
    date: null,
  },
  summary: 'Dokument jest umową serwisową.',
  keyPoints: [],
  entities: { organizations: [], people: [] },
  amounts: [],
  dates: [],
  keywords: [],
};

function mockFetch(status: number, body: unknown) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status })));
}

async function errorCodeOf(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof AnalysisApiError) {
      return error.code;
    }
    throw error;
  }
  throw new Error('Expected the request to fail');
}

describe('requestAnalysis', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'https://example.test/analyze');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('returns the result when the response matches the schema', async () => {
    mockFetch(200, validResult);
    const result = await requestAnalysis(request, new AbortController().signal);
    expect(result.summary).toBe('Dokument jest umową serwisową.');
  });

  it('rejects a 200 response that does not match the schema', async () => {
    mockFetch(200, { ...validResult, document: { ...validResult.document, type: 'list' } });
    expect(await errorCodeOf(requestAnalysis(request, new AbortController().signal))).toBe(
      'invalid_response',
    );
  });

  it('passes through the error code returned by the API', async () => {
    mockFetch(429, { error: { code: 'rate_limited' } });
    expect(await errorCodeOf(requestAnalysis(request, new AbortController().signal))).toBe(
      'rate_limited',
    );
  });

  it('maps an unknown error body to internal_error', async () => {
    mockFetch(500, { message: 'something else' });
    expect(await errorCodeOf(requestAnalysis(request, new AbortController().signal))).toBe(
      'internal_error',
    );
  });

  it('maps a network failure to network_error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    expect(await errorCodeOf(requestAnalysis(request, new AbortController().signal))).toBe(
      'network_error',
    );
  });

  it('fails with config_missing when VITE_API_URL is not set', async () => {
    vi.stubEnv('VITE_API_URL', '');
    expect(await errorCodeOf(requestAnalysis(request, new AbortController().signal))).toBe(
      'config_missing',
    );
  });
});
