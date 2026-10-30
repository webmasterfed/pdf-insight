import { z } from 'zod';

// The fields of a pdf.js text item that we read. Marked-content items have no "str".
// pdf.js types its text stream as "any", so every chunk is validated before use.
const textChunkSchema = z.object({
  items: z.array(z.looseObject({ str: z.string().optional(), hasEOL: z.boolean().optional() })),
});

export type PdfTextItem = z.infer<typeof textChunkSchema>['items'][number];

// The part of ReadableStreamDefaultReader that we use (easy to fake in tests).
export type ChunkReader = {
  read(): Promise<{ done: true; value?: unknown } | { done: false; value: unknown }>;
};

// Collects the text items of one page with a plain reader.read() loop. pdf.js's own
// getTextContent() uses "for await" over a ReadableStream, which some iOS Safari versions do
// not support ("undefined is not a function ... readableStream").
export async function readTextItems(reader: ChunkReader): Promise<PdfTextItem[]> {
  const items: PdfTextItem[] = [];
  for (;;) {
    const result = await reader.read();
    if (result.done) {
      return items;
    }
    items.push(...textChunkSchema.parse(result.value).items);
  }
}

// Items without "str" are marked-content markers, not text.
export function pageTextFromItems(items: PdfTextItem[]): string {
  return items
    .map((item) => (item.str === undefined ? '' : item.str + (item.hasEOL ? '\n' : '')))
    .join('')
    .trim();
}
