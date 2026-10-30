import { describe, expect, it } from 'vitest';
import { describeError, findPagesWithoutText } from './extractText.ts';
import { formatPagesWithoutTextWarning } from './pageWarning.ts';

const readablePage = 'Umowa serwisowa zawarta w Warszawie pomiędzy stronami.';

describe('findPagesWithoutText', () => {
  it('returns an empty list when every page has text', () => {
    expect(findPagesWithoutText([readablePage, readablePage])).toEqual([]);
  });

  it('returns 1-based numbers of pages without a text layer', () => {
    const pages = Array.from({ length: 12 }, (_, i) => (i === 10 ? '' : readablePage));
    expect(findPagesWithoutText(pages)).toEqual([11]);
  });

  it('treats pages with only a few characters (e.g. a page number) as without text', () => {
    expect(findPagesWithoutText([readablePage, '- 2 -', '   \n  '])).toEqual([2, 3]);
  });

  it('returns every page when no page has text', () => {
    expect(findPagesWithoutText(['', ''])).toEqual([1, 2]);
  });
});

describe('formatPagesWithoutTextWarning', () => {
  it('returns null when no page was skipped', () => {
    expect(formatPagesWithoutTextWarning([])).toBeNull();
  });

  it('uses the singular form for one page', () => {
    expect(formatPagesWithoutTextWarning([11])).toBe(
      'Strona 11 nie zawiera warstwy tekstowej (prawdopodobnie skan) i została pominięta. Wyniki mogą być niepełne.',
    );
  });

  it('uses the plural form for several pages', () => {
    expect(formatPagesWithoutTextWarning([3, 11])).toMatch(
      /^Strony 3, 11 nie zawierają .* pominięte\./,
    );
  });
});

describe('describeError', () => {
  it('shows the error name, message and pdf.js version', () => {
    expect(describeError(new TypeError('undefined is not a function'), '6.4.299')).toBe(
      'TypeError: undefined is not a function · pdf.js 6.4.299',
    );
  });

  it('truncates the message to 200 characters', () => {
    const details = describeError(new Error('x'.repeat(500)), '6.4.299');
    expect(details).toBe(`Error: ${'x'.repeat(200)} · pdf.js 6.4.299`);
  });

  it('handles values that are not Error objects and a pdf.js that did not load', () => {
    expect(describeError('boom', null)).toBe('string: boom · pdf.js nie załadowano');
  });
});
