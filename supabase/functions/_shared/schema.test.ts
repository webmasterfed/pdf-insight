import { describe, expect, it } from 'vitest';
import { analysisResultSchema, type AnalysisResult } from './schema.ts';

// The example from the brief, with a 3-sentence summary and 3 key points.
function validResult(): AnalysisResult {
  return {
    document: {
      fileName: 'umowa.pdf',
      pages: 4,
      language: 'pl',
      type: 'umowa',
      title: 'Umowa serwisowa',
      date: '2026-09-01',
    },
    summary:
      'Umowa dotyczy świadczenia usług serwisowych. Wynagrodzenie wynosi 12 500 zł. Płatność następuje do 1 października 2026 r.',
    keyPoints: ['Usługi serwisowe', 'Wynagrodzenie 12 500 PLN', 'Termin płatności 2026-10-01'],
    entities: { organizations: ['ACME Sp. z o.o.'], people: ['Jan Kowalski'] },
    amounts: [{ value: 12500, currency: 'PLN', context: 'wynagrodzenie' }],
    dates: [{ date: '2026-10-01', context: 'termin płatności' }],
    keywords: ['serwis', 'umowa'],
  };
}

function parse(input: unknown) {
  return analysisResultSchema.safeParse(input);
}

function withoutKey(source: object, key: string): Record<string, unknown> {
  return Object.fromEntries(Object.entries(source).filter(([name]) => name !== key));
}

describe('analysisResultSchema', () => {
  it('accepts a valid result', () => {
    expect(parse(validResult()).success).toBe(true);
  });

  it('rejects a result with a missing top-level field', () => {
    expect(parse(withoutKey(validResult(), 'summary')).success).toBe(false);
  });

  it('rejects a result with a missing document field', () => {
    const result = validResult();
    const document = withoutKey(result.document, 'pages');
    expect(parse({ ...result, document }).success).toBe(false);
  });

  it('rejects a document type outside the enum', () => {
    const result = validResult();
    expect(parse({ ...result, document: { ...result.document, type: 'list' } }).success).toBe(
      false,
    );
  });

  it('allows null for missing document date, title and language', () => {
    const result = validResult();
    const document = { ...result.document, date: null, title: null, language: null };
    expect(parse({ ...result, document }).success).toBe(true);
  });

  it('allows empty arrays when information is missing', () => {
    const result: AnalysisResult = {
      ...validResult(),
      keyPoints: [],
      entities: { organizations: [], people: [] },
      amounts: [],
      dates: [],
      keywords: [],
    };
    expect(parse(result).success).toBe(true);
  });

  it('keeps extra fields instead of rejecting or removing them', () => {
    const parsed = parse({ ...validResult(), confidence: 'high' });
    expect(parsed.success).toBe(true);
    expect(parsed.data).toHaveProperty('confidence', 'high');
  });

  it.each(['ZŁ', 'zł', 'pln', 'XYZ', 'EURO'])('rejects invalid currency code %s', (currency) => {
    const amounts = [{ value: 100, currency, context: 'opłata' }];
    expect(parse({ ...validResult(), amounts }).success).toBe(false);
  });

  it('allows a null currency when it is not stated', () => {
    const amounts = [{ value: 100, currency: null, context: 'opłata' }];
    expect(parse({ ...validResult(), amounts }).success).toBe(true);
  });

  it.each(['01.10.2026', '2026-13-01', '2026-02-30', 'październik 2026'])(
    'rejects non-ISO or impossible date %s',
    (date) => {
      expect(parse({ ...validResult(), dates: [{ date, context: 'termin' }] }).success).toBe(false);
    },
  );

  it('rejects a language that is not a 2-letter ISO 639-1 code', () => {
    const result = validResult();
    const document = { ...result.document, language: 'polish' };
    expect(parse({ ...result, document }).success).toBe(false);
  });

  it('rejects a summary longer than 5 sentences', () => {
    const summary = 'Jeden. Dwa. Trzy. Cztery. Pięć. Sześć.';
    expect(parse({ ...validResult(), summary }).success).toBe(false);
  });

  it('rejects more than 7 key points', () => {
    const keyPoints = Array.from({ length: 8 }, (_, i) => `Punkt ${String(i + 1)}`);
    expect(parse({ ...validResult(), keyPoints }).success).toBe(false);
  });

  it('rejects a non-numeric amount value', () => {
    const amounts = [{ value: '12 500,00', currency: 'PLN', context: 'wynagrodzenie' }];
    expect(parse({ ...validResult(), amounts }).success).toBe(false);
  });
});
