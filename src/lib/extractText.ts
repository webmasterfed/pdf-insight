// Vite copies the worker file into the build and gives us its final URL (including the
// /pdf-insight/ base), so pdf.js can start its worker on GitHub Pages too.
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// A page with fewer letters or digits than this has no usable text layer (scan or blank page).
export const MIN_PAGE_CHARACTERS = 20;

export type ExtractedPdf = {
  // Text of the readable pages only.
  text: string;
  pages: number;
  // 1-based numbers of pages skipped because they have no text layer.
  pagesWithoutText: number[];
};

export type PdfErrorCode = 'password' | 'invalid' | 'no-text-layer' | 'unknown';

const ERROR_MESSAGES: Record<PdfErrorCode, string> = {
  password: 'Dokument jest zabezpieczony hasłem. Usuń hasło i spróbuj ponownie.',
  invalid: 'Nie udało się odczytać pliku PDF. Plik może być uszkodzony.',
  'no-text-layer':
    'Ten PDF nie zawiera warstwy tekstowej – wygląda na skan, zdjęcie lub pustą stronę. ' +
    'Rozpoznawanie tekstu (OCR) nie jest obsługiwane. Wybierz PDF z tekstem, który da się zaznaczyć.',
  unknown: 'Wystąpił nieoczekiwany błąd podczas odczytu pliku PDF.',
};

export class PdfError extends Error {
  readonly code: PdfErrorCode;

  constructor(code: PdfErrorCode) {
    super(ERROR_MESSAGES[code]);
    this.name = 'PdfError';
    this.code = code;
  }
}

export function countMeaningfulCharacters(text: string): number {
  return text.match(/[\p{L}\p{N}]/gu)?.length ?? 0;
}

export function findPagesWithoutText(pageTexts: string[]): number[] {
  return pageTexts.flatMap((pageText, index) =>
    countMeaningfulCharacters(pageText) < MIN_PAGE_CHARACTERS ? [index + 1] : [],
  );
}

function toPdfError(error: unknown): PdfError {
  if (error instanceof Error && error.name === 'PasswordException') {
    return new PdfError('password');
  }
  if (error instanceof Error && error.name === 'InvalidPDFException') {
    return new PdfError('invalid');
  }
  return new PdfError('unknown');
}

export async function extractPdfText(data: ArrayBuffer): Promise<ExtractedPdf> {
  // Loaded on demand so the first page load stays small.
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const loadingTask = pdfjs.getDocument({ data });
  try {
    const pdf = await loadingTask.promise;
    const pageTexts: string[] = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      // Items without "str" are marked-content markers, not text.
      const pageText = content.items
        .map((item) => ('str' in item ? item.str + (item.hasEOL ? '\n' : '') : ''))
        .join('');
      pageTexts.push(pageText.trim());
    }

    const pagesWithoutText = findPagesWithoutText(pageTexts);
    if (pagesWithoutText.length === pdf.numPages) {
      throw new PdfError('no-text-layer');
    }
    const text = pageTexts
      .filter((_, index) => !pagesWithoutText.includes(index + 1))
      .join('\n\n')
      .trim();
    return { text, pages: pdf.numPages, pagesWithoutText };
  } catch (error) {
    throw error instanceof PdfError ? error : toPdfError(error);
  } finally {
    // Frees the document and its worker, whether loading succeeded or failed.
    await loadingTask.destroy();
  }
}
