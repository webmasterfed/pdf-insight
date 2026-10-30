import { useEffect, useState } from 'react';
import type { AnalysisResult } from '../../supabase/functions/_shared/schema.ts';
import { toPrettyJson } from '../lib/download.ts';

type JsonPreviewProps = {
  result: AnalysisResult;
};

type CopyStatus = 'idle' | 'copied' | 'failed';

const COPY_MESSAGES: Record<CopyStatus, string> = {
  idle: '',
  copied: 'Skopiowano',
  failed: 'Nie udało się skopiować. Zaznacz tekst i skopiuj go ręcznie.',
};

// React escapes text content, so model output is shown as plain text and can never become HTML.
export function JsonPreview({ result }: JsonPreviewProps) {
  const json = toPrettyJson(result);
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle');

  // Hides the status message again after a few seconds.
  useEffect(() => {
    if (copyStatus === 'idle') {
      return;
    }
    const timer = setTimeout(() => {
      setCopyStatus('idle');
    }, 3000);
    return () => {
      clearTimeout(timer);
    };
  }, [copyStatus]);

  async function handleCopy() {
    try {
      // Missing in insecure contexts and may be refused by the browser; both end up in catch.
      await navigator.clipboard.writeText(json);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('failed');
    }
  }

  return (
    <section className="json-preview" aria-labelledby="json-preview-title">
      <h2 id="json-preview-title">Dane JSON</h2>
      <div
        className="json-preview__scroll"
        tabIndex={0}
        role="region"
        aria-label="Podgląd danych JSON"
      >
        <div className="json-preview__toolbar">
          <button
            type="button"
            className="button button--small"
            onClick={() => {
              void handleCopy();
            }}
          >
            Kopiuj JSON
          </button>
        </div>
        <pre className="json-preview__code">
          <code>{json}</code>
        </pre>
      </div>
      <p className="json-preview__status" aria-live="polite">
        {COPY_MESSAGES[copyStatus]}
      </p>
    </section>
  );
}
