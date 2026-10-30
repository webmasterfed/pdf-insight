import {
  AMOUNTS_MAX,
  DATES_MAX,
  DOCUMENT_TYPES,
  KEY_POINTS_MAX,
  KEYWORDS_MAX,
} from '../_shared/schema.ts';

// JSON Schema sent to Gemini's structured output mode. It steers the model towards the right
// shape; the Zod schema is still the real check, because the model may ignore some keywords.
const nullableString = { type: ['string', 'null'] };
const stringList = { type: 'array', items: { type: 'string' } };

export const ANALYSIS_JSON_SCHEMA = {
  type: 'object',
  properties: {
    document: {
      type: 'object',
      properties: {
        fileName: { type: 'string' },
        pages: { type: 'integer' },
        language: { type: ['string', 'null'], description: 'ISO 639-1 code, e.g. "pl"' },
        type: { type: 'string', enum: [...DOCUMENT_TYPES] },
        title: nullableString,
        date: { type: ['string', 'null'], format: 'date' },
      },
      required: ['fileName', 'pages', 'language', 'type', 'title', 'date'],
    },
    summary: { type: 'string', description: '3 to 5 sentences in the document language' },
    keyPoints: { ...stringList, maxItems: KEY_POINTS_MAX },
    entities: {
      type: 'object',
      properties: { organizations: stringList, people: stringList },
      required: ['organizations', 'people'],
    },
    amounts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          value: { type: 'number' },
          currency: { type: ['string', 'null'], description: 'ISO 4217 code, e.g. "PLN"' },
          context: { type: 'string' },
        },
        required: ['value', 'currency', 'context'],
      },
      maxItems: AMOUNTS_MAX,
    },
    dates: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          date: { type: ['string', 'null'], format: 'date' },
          context: { type: 'string' },
        },
        required: ['date', 'context'],
      },
      maxItems: DATES_MAX,
    },
    keywords: { ...stringList, maxItems: KEYWORDS_MAX },
  },
  required: ['document', 'summary', 'keyPoints', 'entities', 'amounts', 'dates', 'keywords'],
};
