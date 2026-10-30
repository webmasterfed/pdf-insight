// Common abbreviations that end with a dot and are usually followed by a capital letter or a
// digit, so the capital-letter rule below alone would split on them (Polish and English).
// "r." (rok) and "zł." are not listed: mid-sentence they are followed by a lowercase word.
const ABBREVIATIONS = new Set([
  'ul',
  'nr',
  'np',
  'tj',
  'tzw',
  'pkt',
  'ust',
  'art',
  'godz',
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
  // Polish legal forms, e.g. "ACME sp. z o.o.", "Kwadrat S.A.", "Nowak s.c.".
  'sp',
  'o.o',
  's.a',
  's.c',
  'sp.j',
  'sp.k',
]);

// A sentence boundary: ., ! or ? (possibly repeated or followed by a closing quote/bracket),
// then whitespace and the start of a new sentence (capital letter, digit or opening quote).
// The word before the punctuation is captured to filter out abbreviations.
const BOUNDARY = /(\S+?)[.!?]+["')\]»”]*\s+(?=[\p{Lu}\p{N}"„«(])/gu;

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
