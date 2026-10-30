import { describe, expect, it } from 'vitest';
import { hasPdfSignature, MAX_FILE_SIZE_BYTES, validateFileInfo } from './validateFile.ts';
import { countMeaningfulCharacters } from './extractText.ts';

describe('validateFileInfo', () => {
  it('accepts a PDF within the size limit', () => {
    expect(validateFileInfo('umowa.pdf', 'application/pdf', 1024)).toEqual({ ok: true });
  });

  it('accepts a .pdf name when the browser reports no MIME type', () => {
    expect(validateFileInfo('UMOWA.PDF', '', 1024).ok).toBe(true);
  });

  it('rejects other file types', () => {
    expect(validateFileInfo('notatki.docx', 'application/msword', 1024).ok).toBe(false);
  });

  it('rejects an empty file', () => {
    expect(validateFileInfo('pusty.pdf', 'application/pdf', 0).ok).toBe(false);
  });

  it('accepts exactly 10 MB and rejects one byte more', () => {
    expect(validateFileInfo('a.pdf', 'application/pdf', MAX_FILE_SIZE_BYTES).ok).toBe(true);
    const tooLarge = validateFileInfo('a.pdf', 'application/pdf', MAX_FILE_SIZE_BYTES + 1);
    expect(tooLarge).toEqual({
      ok: false,
      message: 'Plik jest za duży (10,0 MB). Maksymalny rozmiar to 10 MB.',
    });
  });
});

describe('hasPdfSignature', () => {
  it('recognises the %PDF- header', () => {
    expect(hasPdfSignature(new TextEncoder().encode('%PDF-1.7'))).toBe(true);
  });

  it('rejects a renamed file with a different header', () => {
    // A .docx / .zip file starts with "PK".
    expect(hasPdfSignature(new TextEncoder().encode('PK\u0003\u0004'))).toBe(false);
  });
});

describe('countMeaningfulCharacters', () => {
  it('counts letters (including Polish) and digits, ignoring spaces and punctuation', () => {
    expect(countMeaningfulCharacters('Zażółć 12 . - \n')).toBe(8);
  });
});
