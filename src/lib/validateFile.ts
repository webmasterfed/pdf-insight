export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

// Every PDF file starts with these bytes: "%PDF-".
const PDF_SIGNATURE = [0x25, 0x50, 0x44, 0x46, 0x2d];

export type ValidationResult = { ok: true } | { ok: false; message: string };

function formatMegabytes(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(1).replace('.', ',');
}

// Checks what we know without reading the file: name, declared type and size.
export function validateFileInfo(name: string, type: string, size: number): ValidationResult {
  const looksLikePdf = type === 'application/pdf' || name.toLowerCase().endsWith('.pdf');
  if (!looksLikePdf) {
    return { ok: false, message: 'Nieobsługiwany format pliku. Wybierz plik PDF.' };
  }
  if (size === 0) {
    return { ok: false, message: 'Plik jest pusty. Wybierz inny dokument PDF.' };
  }
  if (size > MAX_FILE_SIZE_BYTES) {
    return {
      ok: false,
      message: `Plik jest za duży (${formatMegabytes(size)} MB). Maksymalny rozmiar to 10 MB.`,
    };
  }
  return { ok: true };
}

// The name and type can lie (e.g. a .docx renamed to .pdf), the first bytes cannot.
export function hasPdfSignature(firstBytes: Uint8Array): boolean {
  return PDF_SIGNATURE.every((byte, index) => firstBytes[index] === byte);
}

export async function validateFile(file: File): Promise<ValidationResult> {
  const infoResult = validateFileInfo(file.name, file.type, file.size);
  if (!infoResult.ok) {
    return infoResult;
  }
  let header: Uint8Array;
  try {
    header = new Uint8Array(await file.slice(0, PDF_SIGNATURE.length).arrayBuffer());
  } catch {
    // E.g. a cloud file that is no longer available on the device.
    return { ok: false, message: 'Nie udało się odczytać pliku. Wybierz go ponownie.' };
  }
  if (!hasPdfSignature(header)) {
    return { ok: false, message: 'Plik nie jest prawidłowym dokumentem PDF.' };
  }
  return { ok: true };
}
