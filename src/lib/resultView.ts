import type { AnalysisResult } from '../../supabase/functions/_shared/schema.ts';

type Amount = AnalysisResult['amounts'][number];
type DateEntry = AnalysisResult['dates'][number];

export type CurrencyGroup = { currency: string | null; amounts: Amount[] };

// Groups amounts by currency, keeping the order in which each currency first appears
// (the model lists the most important amounts first).
export function groupAmountsByCurrency(amounts: Amount[]): CurrencyGroup[] {
  const groups: CurrencyGroup[] = [];
  for (const amount of amounts) {
    const group = groups.find((g) => g.currency === amount.currency);
    if (group) {
      group.amounts.push(amount);
    } else {
      groups.push({ currency: amount.currency, amounts: [amount] });
    }
  }
  return groups;
}

// ISO dates sort correctly as strings; entries without a date go last. Display only:
// the JSON keeps the order returned by the model.
export function sortDatesChronologically(dates: DateEntry[]): DateEntry[] {
  return [...dates].sort((a, b) => {
    if (a.date === b.date) return 0;
    if (a.date === null) return 1;
    if (b.date === null) return -1;
    return a.date < b.date ? -1 : 1;
  });
}
