import type { AnalysisResult } from '../../supabase/functions/_shared/schema.ts';
import { formatIsoDate } from '../lib/format.ts';
import { sortDatesChronologically } from '../lib/resultView.ts';
import './DatesTimeline.css';

type DatesTimelineProps = {
  dates: AnalysisResult['dates'];
};

// An ordered list with <time> elements: screen readers announce it as a normal list,
// the connecting line and dots are pure CSS decoration.
export function DatesTimeline({ dates }: DatesTimelineProps) {
  return (
    <ol className="timeline">
      {sortDatesChronologically(dates).map((entry, index) => (
        <li key={`${String(index)}-${entry.date ?? 'brak'}`}>
          {entry.date ? (
            <time dateTime={entry.date}>{formatIsoDate(entry.date)}</time>
          ) : (
            <span className="timeline__no-date">{formatIsoDate(null)}</span>
          )}
          <span className="timeline__label">{entry.context}</span>
        </li>
      ))}
    </ol>
  );
}
