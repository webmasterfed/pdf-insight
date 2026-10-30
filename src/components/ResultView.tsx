import { useEffect, useRef } from 'react';
import type { AnalysisResult } from '../../supabase/functions/_shared/schema.ts';
import { downloadResultAsJson } from '../lib/download.ts';
import { formatAmount, formatDocumentType, formatIsoDate, formatLanguage } from '../lib/format.ts';
import { JsonPreview } from './JsonPreview.tsx';

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

export function ResultView({ result, warning, onNewDocument }: ResultViewProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { document: info } = result;

  // Moves keyboard and screen-reader focus to the results as soon as they appear.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <section className="result" aria-labelledby="result-title">
      <div className="result__header">
        <h2 id="result-title" ref={headingRef} tabIndex={-1}>
          Wyniki analizy
        </h2>
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

      <div className="card">
        <h3>{info.title ?? info.fileName}</h3>
        <dl className="facts">
          <dt>Typ</dt>
          <dd>{formatDocumentType(info.type)}</dd>
          <dt>Data dokumentu</dt>
          <dd>{formatIsoDate(info.date)}</dd>
          <dt>Język</dt>
          <dd>{formatLanguage(info.language)}</dd>
          <dt>Strony</dt>
          <dd>{info.pages}</dd>
          <dt>Plik</dt>
          <dd className="break">{info.fileName}</dd>
        </dl>
      </div>

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
          <div className="table-scroll" tabIndex={0} role="region" aria-label="Tabela kwot">
            <table>
              <thead>
                <tr>
                  <th scope="col">Kwota</th>
                  <th scope="col">Kontekst</th>
                </tr>
              </thead>
              <tbody>
                {result.amounts.map((amount, index) => (
                  <tr key={`${String(index)}-${String(amount.value)}`}>
                    <td className="nowrap">{formatAmount(amount.value, amount.currency)}</td>
                    <td>{amount.context}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <h3>Daty</h3>
        {result.dates.length === 0 ? (
          <EmptyHint />
        ) : (
          <div className="table-scroll" tabIndex={0} role="region" aria-label="Tabela dat">
            <table>
              <thead>
                <tr>
                  <th scope="col">Data</th>
                  <th scope="col">Kontekst</th>
                </tr>
              </thead>
              <tbody>
                {result.dates.map((entry, index) => (
                  <tr key={`${String(index)}-${entry.date ?? 'brak'}`}>
                    <td className="nowrap">{formatIsoDate(entry.date)}</td>
                    <td>{entry.context}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
