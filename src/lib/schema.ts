import { z } from 'zod';
import { countSentences } from './sentences.ts';

export const DOCUMENT_TYPES = ['faktura', 'umowa', 'oferta', 'raport', 'inne'] as const;

export const SUMMARY_MAX_SENTENCES = 5;
export const KEY_POINTS_MAX = 7;
export const KEYWORDS_MAX = 15;

// Built once from the runtime's ICU data, e.g. PLN, EUR, USD.
const ISO_4217_CODES = new Set(Intl.supportedValuesOf('currency'));

const nonEmptyText = z.string().trim().min(1);

// ISO 8601 calendar date "YYYY-MM-DD"; Zod also rejects impossible dates such as 2026-02-30.
const isoDate = z.iso.date();

const languageCode = z.string().regex(/^[a-z]{2}$/, 'Expected an ISO 639-1 code, e.g. "pl"');

const currencyCode = z
  .string()
  .refine((code) => ISO_4217_CODES.has(code), 'Expected an ISO 4217 code, e.g. "PLN"');

// Loose objects keep extra fields: the brief allows adding fields, never removing them.
export const documentInfoSchema = z.looseObject({
  fileName: nonEmptyText,
  pages: z.number().int().positive(),
  language: languageCode.nullable(),
  type: z.enum(DOCUMENT_TYPES),
  title: nonEmptyText.nullable(),
  date: isoDate.nullable(),
});

export const amountSchema = z.looseObject({
  // Zod 4 numbers already reject NaN and Infinity.
  value: z.number(),
  currency: currencyCode.nullable(),
  context: nonEmptyText,
});

export const dateEntrySchema = z.looseObject({
  date: isoDate.nullable(),
  context: nonEmptyText,
});

export const analysisResultSchema = z.looseObject({
  document: documentInfoSchema,
  // At most 5 sentences. The prompt asks for 3-5; fewer is accepted only so a near-empty
  // document never forces the model to invent facts to reach the minimum.
  summary: nonEmptyText.refine(
    (text) => countSentences(text) <= SUMMARY_MAX_SENTENCES,
    `Summary must have at most ${String(SUMMARY_MAX_SENTENCES)} sentences`,
  ),
  keyPoints: z.array(nonEmptyText).max(KEY_POINTS_MAX),
  entities: z.looseObject({
    organizations: z.array(nonEmptyText),
    people: z.array(nonEmptyText),
  }),
  amounts: z.array(amountSchema),
  dates: z.array(dateEntrySchema),
  keywords: z.array(nonEmptyText).max(KEYWORDS_MAX),
});

export type AnalysisResult = z.infer<typeof analysisResultSchema>;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];
