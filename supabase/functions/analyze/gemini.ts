import { z } from 'zod';

const GEMINI_TIMEOUT_MS = 25_000;

export class UpstreamError extends Error {
  readonly code: 'ai_unavailable' | 'ai_timeout';

  constructor(code: 'ai_unavailable' | 'ai_timeout', detail: string) {
    super(detail);
    this.name = 'UpstreamError';
    this.code = code;
  }
}

// Only the parts of Gemini's response we read. "thought" parts are internal reasoning.
const geminiResponseSchema = z.object({
  candidates: z
    .array(
      z.object({
        content: z
          .object({
            parts: z.array(
              z.object({ text: z.string().optional(), thought: z.boolean().optional() }),
            ),
          })
          .optional(),
      }),
    )
    .optional(),
});

type GenerateJsonOptions = {
  apiKey: string;
  model: string;
  systemInstruction: string;
  userMessage: string;
  jsonSchema: object;
};

// Returns the model's raw JSON text; the caller parses and validates it.
export async function generateJson(options: GenerateJsonOptions): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(options.model)}:generateContent`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': options.apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: options.systemInstruction }] },
        contents: [{ role: 'user', parts: [{ text: options.userMessage }] }],
        generationConfig: {
          responseFormat: { text: { mimeType: 'APPLICATION_JSON', schema: options.jsonSchema } },
        },
      }),
      signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      throw new UpstreamError('ai_timeout', 'Gemini request timed out');
    }
    throw new UpstreamError('ai_unavailable', 'Gemini request failed');
  }

  if (!response.ok) {
    // Only the status is kept: the error body could echo parts of the request.
    throw new UpstreamError('ai_unavailable', `Gemini HTTP ${String(response.status)}`);
  }

  const parsed = geminiResponseSchema.safeParse(await response.json());
  const parts = parsed.success ? (parsed.data.candidates?.[0]?.content?.parts ?? []) : [];
  return parts
    .filter((part) => !part.thought)
    .map((part) => part.text ?? '')
    .join('');
}
