import { describe, expect, it } from 'vitest';
import { analyzeRequestSchema } from './api.ts';

const base = { text: 'Umowa serwisowa.', fileName: 'umowa.pdf', pages: 12 };

describe('analyzeRequestSchema', () => {
  it('defaults pagesWithoutText to an empty list for older clients', () => {
    const parsed = analyzeRequestSchema.parse(base);
    expect(parsed.pagesWithoutText).toEqual([]);
  });

  it('accepts skipped pages within the page count', () => {
    expect(analyzeRequestSchema.safeParse({ ...base, pagesWithoutText: [11] }).success).toBe(true);
  });

  it('rejects skipped pages beyond the page count', () => {
    expect(analyzeRequestSchema.safeParse({ ...base, pagesWithoutText: [13] }).success).toBe(false);
  });
});
