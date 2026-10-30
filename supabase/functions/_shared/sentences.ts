// Common abbreviations that end with a dot but do not end a sentence (Polish and English).
const ABBREVIATIONS = new Set([
  'r',
  'ul',
  'nr',
  'np',
  'tj',
  'tzw',
  'pkt',
  'ust',
  'art',
  'godz',
  'zł',
  'al',
  'im',
  'św',
  'prof',
  'dr',
  'mgr',
  'inż',
  'mr',
  'mrs',
  'ms',
  'no',
  'vs',
  'etc',
  'inc',
  'ltd',
  'e.g',
  'i.e',
  'm.in',
]);

// A sentence boundary: ., ! or ? (possibly repeated or followed by a closing quote/bracket),
// then whitespace. The word before the punctuation is captured to filter out abbreviations.
const BOUNDARY = /(\S+?)[.!?]+["')\]»”]*\s+/g;

export function countSentences(text: string): number {
  const trimmed = text.trim();
  if (trimmed === '') {
    return 0;
  }

  let count = 1;
  for (const match of trimmed.matchAll(BOUNDARY)) {
    const wordBefore = (match[1] ?? '').replace(/^["'(„«]+/, '').toLowerCase();
    if (!ABBREVIATIONS.has(wordBefore)) {
      count += 1;
    }
  }
  return count;
}
