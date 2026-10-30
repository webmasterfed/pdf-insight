import { describe, expect, it } from 'vitest';
import { groupAmountsByCurrency, sortDatesChronologically } from './resultView.ts';

describe('groupAmountsByCurrency', () => {
  it('groups by currency in order of first appearance', () => {
    const groups = groupAmountsByCurrency([
      { value: 100, currency: 'PLN', context: 'Opłata' },
      { value: 50, currency: 'EUR', context: 'Licencja' },
      { value: 20, currency: 'PLN', context: 'Kara' },
      { value: 5, currency: null, context: 'Bez waluty' },
    ]);
    expect(groups.map((g) => [g.currency, g.amounts.length])).toEqual([
      ['PLN', 2],
      ['EUR', 1],
      [null, 1],
    ]);
  });

  it('returns no groups for no amounts', () => {
    expect(groupAmountsByCurrency([])).toEqual([]);
  });
});

describe('sortDatesChronologically', () => {
  it('sorts dates ascending and puts missing dates last', () => {
    const sorted = sortDatesChronologically([
      { date: '2027-03-31', context: 'Koniec' },
      { date: null, context: 'Bez daty' },
      { date: '2026-03-12', context: 'Zawarcie' },
    ]);
    expect(sorted.map((d) => d.context)).toEqual(['Zawarcie', 'Koniec', 'Bez daty']);
  });

  it('does not change the original array', () => {
    const dates = [
      { date: '2027-01-01', context: 'B' },
      { date: '2026-01-01', context: 'A' },
    ];
    sortDatesChronologically(dates);
    expect(dates[0]?.context).toBe('B');
  });
});
