import {
  apiErrorResponseSchema,
  MAX_TEXT_CHARACTERS,
  type AnalyzeRequest,
} from '../../supabase/functions/_shared/api.ts';
import {
  analysisResultSchema,
  type AnalysisResult,
} from '../../supabase/functions/_shared/schema.ts';
import type { ClientErrorCode } from './errorMessages.ts';

// Long enough for one retry on the server (2 x 25 s Gemini timeout) plus network time.
const REQUEST_TIMEOUT_MS = 60_000;

export class AnalysisApiError extends Error {
  readonly code: ClientErrorCode;

  constructor(code: ClientErrorCode) {
    super(code);
    this.name = 'AnalysisApiError';
    this.code = code;
  }
}

// Throws AnalysisApiError for every failure, or the AbortError when the user cancels.
export async function requestAnalysis(
  request: AnalyzeRequest,
  cancelSignal: AbortSignal,
): Promise<AnalysisResult> {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) {
    throw new AnalysisApiError('config_missing');
  }
  if (request.text.length > MAX_TEXT_CHARACTERS) {
    throw new AnalysisApiError('text_too_long');
  }

  const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: AbortSignal.any([cancelSignal, timeoutSignal]),
    });
  } catch (error) {
    if (cancelSignal.aborted) {
      throw error;
    }
    throw new AnalysisApiError(timeoutSignal.aborted ? 'timeout' : 'network_error');
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new AnalysisApiError('invalid_response');
  }

  if (!response.ok) {
    const apiError = apiErrorResponseSchema.safeParse(body);
    throw new AnalysisApiError(apiError.success ? apiError.data.error.code : 'internal_error');
  }

  // The response is validated again in the browser BEFORE anything is displayed.
  const result = analysisResultSchema.safeParse(body);
  if (!result.success) {
    throw new AnalysisApiError('invalid_response');
  }
  return result.data;
}
