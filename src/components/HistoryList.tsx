import type { HistoryEntry } from '../lib/history.ts';

type HistoryListProps = {
  entries: HistoryEntry[];
  onOpen: (entry: HistoryEntry) => void;
  onClear: () => void;
};

function formatSavedAt(isoDateTime: string): string {
  return new Date(isoDateTime).toLocaleString('pl-PL', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export function HistoryList({ entries, onOpen, onClear }: HistoryListProps) {
  if (entries.length === 0) {
    return null;
  }
  return (
    <section className="history" aria-labelledby="history-title">
      <div className="history__header">
        <h2 id="history-title">Ostatnie analizy</h2>
        <button type="button" className="button button--secondary button--small" onClick={onClear}>
          Wyczyść historię
        </button>
      </div>
      <p className="muted">Historia jest zapisywana tylko w tej przeglądarce.</p>
      <ul className="history__list">
        {entries.map((entry) => (
          <li key={entry.id}>
            <span className="history__name">
              {entry.result.document.title ?? entry.result.document.fileName}
            </span>
            <span className="muted history__date">{formatSavedAt(entry.savedAt)}</span>
            <button
              type="button"
              className="button button--small"
              onClick={() => {
                onOpen(entry);
              }}
              aria-label={`Otwórz analizę: ${entry.result.document.fileName}`}
            >
              Otwórz
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
