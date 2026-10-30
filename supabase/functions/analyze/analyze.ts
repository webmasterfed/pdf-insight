import type { AnalyzeRequest } from '../_shared/api.ts';
import { analysisResultSchema, type AnalysisResult } from '../_shared/schema.ts';
import { generateJson } from './gemini.ts';
import { buildUserMessage, SYSTEM_INSTRUCTION } from './prompt.ts';
import { ANALYSIS_JSON_SCHEMA } from './responseSchema.ts';

// The brief allows exactly one retry after an invalid AI response.
const MAX_ATTEMPTS = 2;

export class InvalidAiResponseError extends Error {
  readonly code = 'ai_invalid_response';

  // "problems" lists schema paths and Zod messages only, never document text, so it is safe to log.
  constructor(problems: string) {
    super(`The AI returned an invalid response twice: ${problems}`);
    this.name = 'InvalidAiResponseError';
  }
}

type ParseOutcome = { ok: true; result: AnalysisResult } | { ok: false; problems: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseModelOutput(raw: string, request: AnalyzeRequest): ParseOutcome {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { ok: false, problems: 'the answer was not valid JSON' };
  }

  // We know the real file name and page count, so the model's values are never trusted for them.
  if (isRecord(json) && isRecord(json.document)) {
    json = {
      ...json,
      document: { ...json.document, fileName: request.fileName, pages: request.pages },
    };
  }

  const parsed = analysisResultSchema.safeParse(json);
  if (parsed.success) {
    return { ok: true, result: parsed.data };
  }
  const problems = parsed.error.issues
    .slice(0, 10)
    .map((issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`)
    .join('; ');
  return { ok: false, problems };
}

export async function analyzeDocument(
  request: AnalyzeRequest,
  apiKey: string,
  model: string,
): Promise<AnalysisResult> {
  const documentId = crypto.randomUUID();
  let previousProblems: string | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const raw = await generateJson({
      apiKey,
      model,
      systemInstruction: SYSTEM_INSTRUCTION,
      userMessage: buildUserMessage(request, documentId, previousProblems),
      jsonSchema: ANALYSIS_JSON_SCHEMA,
    });
    const outcome = parseModelOutput(raw, request);
    if (outcome.ok) {
      return outcome.result;
    }
    previousProblems = outcome.problems;
  }
  throw new InvalidAiResponseError(previousProblems ?? 'unknown');
}
