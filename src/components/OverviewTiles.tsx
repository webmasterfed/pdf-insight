import type { AnalysisResult } from '../../supabase/functions/_shared/schema.ts';
import { formatDocumentType, formatIsoDate, formatLanguage } from '../lib/format.ts';
import './OverviewTiles.css';

type OverviewTilesProps = {
  document: AnalysisResult['document'];
};

// The key facts at a glance. The type badge has a text label, so color is never the only cue.
export function OverviewTiles({ document: info }: OverviewTilesProps) {
  return (
    <div className="card overview">
      <h3>{info.title ?? info.fileName}</h3>
      <p className="muted overview__file">{info.fileName}</p>
      <dl className="tiles">
        <div className="tile">
          <dt>Typ</dt>
          <dd>
            <span className={`badge badge--${info.type}`}>{formatDocumentType(info.type)}</span>
          </dd>
        </div>
        <div className="tile">
          <dt>Strony</dt>
          <dd>{info.pages}</dd>
        </div>
        <div className="tile">
          <dt>Język</dt>
          <dd>{formatLanguage(info.language)}</dd>
        </div>
        <div className="tile">
          <dt>Data dokumentu</dt>
          <dd>{formatIsoDate(info.date)}</dd>
        </div>
      </dl>
    </div>
  );
}
