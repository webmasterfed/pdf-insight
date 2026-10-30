import type { AnalysisResult } from '../../supabase/functions/_shared/schema.ts';

type JsonPreviewProps = {
  result: AnalysisResult;
};

// React escapes text content, so model output is shown as plain text and can never become HTML.
export function JsonPreview({ result }: JsonPreviewProps) {
  return (
    <pre className="json-preview" tabIndex={0} aria-label="Podgląd danych JSON">
      <code>{JSON.stringify(result, null, 2)}</code>
    </pre>
  );
}
