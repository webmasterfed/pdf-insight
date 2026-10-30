import { describe, expect, it } from 'vitest';
import {
  buildJsonFileName,
  formatAmount,
  formatDocumentType,
  formatIsoDate,
  formatLanguage,
} from './format.ts';

// Intl uses a narrow no-break space as the thousands separator in Polish.
function normalizeSpaces(text: string): string {
  return text.replace(/\s/g, ' ');
}

describe('formatIsoDate', () => {
  it('formats an ISO date in the Polish order', () => {
    expect(formatIsoDate('2026-10-01')).toBe('01.10.2026');
  });

  it('shows a placeholder for a missing date', () => {
    expect(formatIsoDate(null)).toBe('brak daty');
  });
});

describe('formatAmount', () => {
  it('formats an amount with its ISO currency code', () => {
    expect(normalizeSpaces(formatAmount(12500, 'PLN'))).toBe('12 500,00 PLN');
    expect(normalizeSpaces(formatAmount(2150, 'EUR'))).toBe('2 150,00 EUR');
    expect(normalizeSpaces(formatAmount(890, 'USD'))).toBe('890,00 USD');
  });

  it('groups thousands in 4-digit amounts too', () => {
    expect(normalizeSpaces(formatAmount(9225, 'PLN'))).toBe('9 225,00 PLN');
  });

  it('always shows two decimal places', () => {
    expect(normalizeSpaces(formatAmount(68080.5, 'PLN'))).toBe('68 080,50 PLN');
  });

  it('formats an amount without a currency as a plain number', () => {
    expect(normalizeSpaces(formatAmount(12500, null))).toBe('12 500,00');
  });
});

describe('labels', () => {
  it('translates the document type', () => {
    expect(formatDocumentType('inne')).toBe('Inny dokument');
  });

  it('shows the language name in Polish', () => {
    expect(formatLanguage('pl')).toBe('polski');
    expect(formatLanguage(null)).toBe('nieznany');
  });
});

describe('buildJsonFileName', () => {
  it('replaces the .pdf extension with .json', () => {
    expect(buildJsonFileName('umowa.pdf')).toBe('umowa.json');
  });

  it('replaces characters that are unsafe in file names', () => {
    expect(buildJsonFileName('Umowa 14/2026.PDF')).toBe('Umowa-14-2026.json');
  });

  it('keeps Polish letters', () => {
    expect(buildJsonFileName('zażółć.pdf')).toBe('zażółć.json');
  });

  it('falls back to a default name', () => {
    expect(buildJsonFileName('.pdf')).toBe('analiza.json');
  });
});
