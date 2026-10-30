import { describe, expect, it } from 'vitest';
import { pageTextFromItems, readTextItems, type ChunkReader } from './pdfText.ts';

function fakeReader(chunks: unknown[]): ChunkReader {
  let index = 0;
  return {
    read: () =>
      Promise.resolve(
        index < chunks.length ? { done: false, value: chunks[index++] } : { done: true },
      ),
  };
}

describe('readTextItems', () => {
  it('collects the items of every chunk in order until the stream is done', async () => {
    const items = await readTextItems(
      fakeReader([
        { items: [{ str: 'Umowa', hasEOL: true }, { type: 'beginMarkedContent' }] },
        { items: [] },
        { items: [{ str: 'serwisowa', hasEOL: false }] },
      ]),
    );
    expect(items).toHaveLength(3);
    expect(pageTextFromItems(items)).toBe('Umowa\nserwisowa');
  });

  it('returns no items for an empty stream', async () => {
    expect(await readTextItems(fakeReader([]))).toEqual([]);
  });

  it('rejects a chunk that is not pdf.js text content', async () => {
    await expect(readTextItems(fakeReader([{ notItems: true }]))).rejects.toThrow();
  });
});

describe('pageTextFromItems', () => {
  it('ignores marked-content items and trims the page text', () => {
    expect(
      pageTextFromItems([{ type: 'beginMarkedContent' }, { str: ' Tekst ', hasEOL: true }]),
    ).toBe('Tekst');
  });
});
