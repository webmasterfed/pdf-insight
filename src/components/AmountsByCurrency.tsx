import type { AnalysisResult } from '../../supabase/functions/_shared/schema.ts';
import { formatAmount } from '../lib/format.ts';
import { groupAmountsByCurrency } from '../lib/resultView.ts';
import './AmountsByCurrency.css';

type AmountsByCurrencyProps = {
  amounts: AnalysisResult['amounts'];
};

export function AmountsByCurrency({ amounts }: AmountsByCurrencyProps) {
  return (
    <div className="amount-groups">
      {groupAmountsByCurrency(amounts).map((group) => (
        <section key={group.currency ?? 'none'} className="amount-group">
          <h4>{group.currency ?? 'Bez waluty'}</h4>
          <ul className="amount-list">
            {group.amounts.map((amount, index) => (
              <li key={`${String(index)}-${String(amount.value)}`}>
                <span className="amount-list__context">{amount.context}</span>
                <span className="amount-list__value">
                  {formatAmount(amount.value, amount.currency)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
