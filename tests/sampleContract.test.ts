import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import { pageTextFromItems, readTextItems } from '../src/lib/pdfText.ts';

// Node 24 lacks Uint8Array.prototype.toHex, which pdf.js 6 uses to fingerprint every document.
// This test-only shim lets pdf.js run in Node; the app itself runs in the browser.
beforeAll(() => {
  if (!('toHex' in Uint8Array.prototype)) {
    Object.defineProperty(Uint8Array.prototype, 'toHex', {
      value(this: Uint8Array) {
        return Array.from(this, (byte) => byte.toString(16).padStart(2, '0')).join('');
      },
    });
  }
});

const samplePath = new URL('./fixtures/sample-contract.pdf', import.meta.url);

describe('reading the sample contract with streamTextContent()', () => {
  it('produces exactly the same page texts as pdf.js getTextContent()', async () => {
    const pdfjs = await import('pdfjs-dist');
    const loadingTask = pdfjs.getDocument({ data: new Uint8Array(readFileSync(samplePath)) });
    try {
      const pdf = await loadingTask.promise;
      expect(pdf.numPages).toBe(12);
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber);
        const viaGetTextContent = pageTextFromItems((await page.getTextContent()).items);
        const viaReader = pageTextFromItems(
          await readTextItems(page.streamTextContent().getReader()),
        );
        expect(viaReader).toBe(viaGetTextContent);
      }
    } finally {
      await loadingTask.destroy();
    }
  });
});
