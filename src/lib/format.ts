import type { DocumentType } from '../../supabase/functions/_shared/schema.ts';

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  faktura: 'Faktura',
  umowa: 'Umowa',
  oferta: 'Oferta',
  raport: 'Raport',
  inne: 'Inny dokument',
};

export function formatDocumentType(type: DocumentType): string {
  return DOCUMENT_TYPE_LABELS[type];
}

// "2026-10-01" -> "01.10.2026". Built from the string parts, not new Date(), so the time zone
// can never shift the day.
export function formatIsoDate(isoDate: string | null): string {
  if (!isoDate) {
    return 'brak daty';
  }
  const [year, month, day] = isoDate.split('-');
  return `${day ?? ''}.${month ?? ''}.${year ?? ''}`;
}

export function formatAmount(value: number, currency: string | null): string {
  if (!currency) {
    return new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2 }).format(value);
  }
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency }).format(value);
}

export function formatLanguage(code: string | null): string {
  if (!code) {
    return 'nieznany';
  }
  try {
    return new Intl.DisplayNames(['pl'], { type: 'language' }).of(code) ?? code;
  } catch {
    return code;
  }
}

// "Umowa 14/2026.PDF" -> "Umowa-14-2026.json": safe on every operating system.
export function buildJsonFileName(pdfFileName: string): string {
  const baseName = pdfFileName
    .replace(/\.pdf$/i, '')
    .replace(/[^\p{L}\p{N}._-]+/gu, '-')
    .replace(/^-+|-+$/g, '');
  return `${baseName || 'analiza'}.json`;
}
