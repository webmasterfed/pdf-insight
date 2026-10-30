import { useEffect, useRef } from 'react';
import type { AnalysisResult } from '../../supabase/functions/_shared/schema.ts';
import { downloadResultAsJson } from '../lib/download.ts';
import { AmountsByCurrency } from './AmountsByCurrency.tsx';
import { DatesTimeline } from './DatesTimeline.tsx';
import { JsonPreview } from './JsonPreview.tsx';
import { OverviewTiles } from './OverviewTiles.tsx';

type ResultViewProps = {
  result: AnalysisResult;
  warning: string | null;
  onNewDocument: () => void;
};

function EmptyHint() {
  return <p className="muted">Brak w dokumencie.</p>;
}

function TextList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <EmptyHint />;
  }
  return (
    <ul>
      {items.map((item, index) => (
        <li key={`${String(index)}-${item}`}>{item}</li>
      ))}
    </ul>
  );
}

function SuccessCheck() {
  return (
    <svg className="success-check" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="11" />
      <path d="M7 12.5l3.2 3.2L17 9" />
    </svg>
  );
}

export function ResultView({ result, warning, onNewDocument }: ResultViewProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Moves keyboard and screen-reader focus to the results as soon as they appear.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <section className="result" aria-labelledby="result-title">
      <div className="result__header">
        <div className="result__title">
          <SuccessCheck />
          <h2 id="result-title" ref={headingRef} tabIndex={-1}>
            Wyniki analizy
          </h2>
        </div>
        <div className="actions">
          <button
            type="button"
            className="button"
            onClick={() => {
              downloadResultAsJson(result);
            }}
          >
            Pobierz JSON
          </button>
          <button type="button" className="button button--secondary" onClick={onNewDocument}>
            Nowy dokument
          </button>
        </div>
      </div>

      {warning && (
        <p className="warning" role="status">
          {warning}
        </p>
      )}

      <OverviewTiles document={result.document} />

      <div className="card">
        <h3>Streszczenie</h3>
        <p>{result.summary}</p>
      </div>

      <div className="card">
        <h3>Najważniejsze punkty</h3>
        <TextList items={result.keyPoints} />
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>Organizacje</h3>
          <TextList items={result.entities.organizations} />
        </div>
        <div className="card">
          <h3>Osoby</h3>
          <TextList items={result.entities.people} />
        </div>
      </div>

      <div className="card">
        <h3>Kwoty</h3>
        {result.amounts.length === 0 ? (
          <EmptyHint />
        ) : (
          <AmountsByCurrency amounts={result.amounts} />
        )}
      </div>

      <div className="card">
        <h3>Daty</h3>
        {result.dates.length === 0 ? <EmptyHint /> : <DatesTimeline dates={result.dates} />}
      </div>

      <div className="card">
        <h3>Słowa kluczowe</h3>
        {result.keywords.length === 0 ? (
          <EmptyHint />
        ) : (
          <ul className="tags">
            {result.keywords.map((keyword, index) => (
              <li key={`${String(index)}-${keyword}`}>{keyword}</li>
            ))}
          </ul>
        )}
      </div>

      <JsonPreview result={result} />
    </section>
  );
}
