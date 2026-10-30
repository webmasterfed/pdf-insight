import { analyzeRequestSchema, type ApiErrorCode } from '../_shared/api.ts';
import { analyzeDocument, InvalidAiResponseError } from './analyze.ts';
import { buildAllowedOrigins, corsHeaders } from './cors.ts';
import { UpstreamError } from './gemini.ts';
import { FixedWindowRateLimiter } from './rateLimit.ts';

const ALLOWED_ORIGINS = buildAllowedOrigins(Deno.env.get('DEV_ORIGINS'));
const MAX_BODY_BYTES = 1_000_000;

// Per visitor: 10 analyses per 10 minutes. For everyone together: 100 per hour, which keeps
// the demo inside the Gemini free tier for the required 14 days.
const perIpLimiter = new FixedWindowRateLimiter(10, 10 * 60_000);
const globalLimiter = new FixedWindowRateLimiter(100, 60 * 60_000);

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  origin_not_allowed: 403,
  method_not_allowed: 405,
  payload_too_large: 413,
  invalid_request: 400,
  rate_limited: 429,
  ai_invalid_response: 502,
  ai_unavailable: 503,
  ai_timeout: 504,
  internal_error: 500,
};

function jsonResponse(body: unknown, status: number, headers: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function errorResponse(code: ApiErrorCode, headers: Record<string, string>): Response {
  return jsonResponse({ error: { code } }, STATUS_BY_CODE[code], headers);
}

function clientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

function toErrorCode(error: unknown): ApiErrorCode {
  if (error instanceof UpstreamError || error instanceof InvalidAiResponseError) {
    return error.code;
  }
  return 'internal_error';
}

Deno.serve(async (request) => {
  // CORS: browsers on other sites get no CORS headers, so they cannot read any response.
  const origin = request.headers.get('Origin');
  if (!origin || !ALLOWED_ORIGINS.has(origin)) {
    return errorResponse('origin_not_allowed', {});
  }
  const cors = corsHeaders(origin);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }
  if (request.method !== 'POST') {
    return errorResponse('method_not_allowed', cors);
  }

  for (const [limiter, key] of [
    [perIpLimiter, clientIp(request)],
    [globalLimiter, 'global'],
  ] as const) {
    const limit = limiter.check(key);
    if (!limit.allowed) {
      return errorResponse('rate_limited', {
        ...cors,
        'Retry-After': String(limit.retryAfterSeconds),
      });
    }
  }

  // Content-Length can be missing or wrong, so the real body size is checked as well.
  if (Number(request.headers.get('Content-Length') ?? 0) > MAX_BODY_BYTES) {
    return errorResponse('payload_too_large', cors);
  }
  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).length > MAX_BODY_BYTES) {
    return errorResponse('payload_too_large', cors);
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return errorResponse('invalid_request', cors);
  }
  const parsedRequest = analyzeRequestSchema.safeParse(body);
  if (!parsedRequest.success) {
    return errorResponse('invalid_request', cors);
  }

  const apiKey = Deno.env.get('GEMINI_API_KEY');
  const model = Deno.env.get('LLM_MODEL');
  if (!apiKey || !model) {
    console.error('Missing GEMINI_API_KEY or LLM_MODEL secret');
    return errorResponse('internal_error', cors);
  }

  try {
    const result = await analyzeDocument(parsedRequest.data, apiKey, model);
    return jsonResponse(result, 200, cors);
  } catch (error) {
    const code = toErrorCode(error);
    // Logs the error code and short detail only, never the document text or the key.
    console.error(
      `analyze failed: ${code} (${error instanceof Error ? error.message : 'unknown'})`,
    );
    return errorResponse(code, cors);
  }
});
