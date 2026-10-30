import type { AnalysisResult } from '../../supabase/functions/_shared/schema.ts';
import { buildJsonFileName } from './format.ts';

export function toPrettyJson(result: AnalysisResult): string {
  return JSON.stringify(result, null, 2);
}

// Creates a temporary link to an in-memory file and clicks it; nothing is uploaded anywhere.
export function downloadResultAsJson(result: AnalysisResult): void {
  const blob = new Blob([toPrettyJson(result)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = buildJsonFileName(result.document.fileName);
  link.click();
  // Released after the browser has started the download (revoking immediately breaks Safari).
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 0);
}
