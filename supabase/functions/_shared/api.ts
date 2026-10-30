import { z } from 'zod';

// About 75-100k tokens: far below the model's context window, large enough for long contracts.
export const MAX_TEXT_CHARACTERS = 300_000;

export const analyzeRequestSchema = z
  .object({
    text: z.string().trim().min(1).max(MAX_TEXT_CHARACTERS),
    fileName: z.string().trim().min(1).max(255),
    pages: z.number().int().min(1).max(5000),
    // Pages skipped because they have no text layer; optional so older clients keep working.
    pagesWithoutText: z.array(z.number().int().min(1)).max(5000).default([]),
  })
  .refine((request) => request.pagesWithoutText.every((page) => page <= request.pages), {
    message: 'pagesWithoutText must be within the page count',
    path: ['pagesWithoutText'],
  });

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;

// Every error the API can return. The frontend maps each code to a Polish message.
export const API_ERROR_CODES = [
  'origin_not_allowed',
  'method_not_allowed',
  'payload_too_large',
  'invalid_request',
  'rate_limited',
  'ai_invalid_response',
  'ai_unavailable',
  'ai_timeout',
  'internal_error',
] as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

export const apiErrorResponseSchema = z.object({
  error: z.object({ code: z.enum(API_ERROR_CODES) }),
});
