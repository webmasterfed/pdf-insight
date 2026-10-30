import { describe, expect, it } from 'vitest';
import { countSentences } from './sentences.ts';

describe('countSentences', () => {
  it('returns 0 for empty text', () => {
    expect(countSentences('   ')).toBe(0);
  });

  it('counts a single sentence without a final dot', () => {
    expect(countSentences('Umowa serwisowa')).toBe(1);
  });

  it('counts sentences ending with . ! and ?', () => {
    expect(countSentences('To jest umowa. Czy jest ważna? Tak!')).toBe(3);
  });

  it('does not split on Polish abbreviations', () => {
    expect(countSentences('Umowę zawarto 1 września 2026 r. w Warszawie przy ul. Długiej 5.')).toBe(
      1,
    );
  });

  it('does not split on Polish legal forms', () => {
    expect(
      countSentences(
        'Umowę zawarli Nordwave Logistics sp. z o.o. oraz Kwadrat Software S.A. w Gdańsku.',
      ),
    ).toBe(1);
    expect(
      countSentences(
        'Biuro Nowak s.c. świadczy usługi. Wykonawcą jest Kwadrat Software S.A. z Gdańska.',
      ),
    ).toBe(2);
  });

  it('counts a sentence that ends with "r." (rok) before a capital letter', () => {
    expect(countSentences('Umowę zawarto 12.03.2026 r. Wynagrodzenie wynosi 100 zł.')).toBe(2);
  });

  it('does not split when the next word starts with a lowercase letter', () => {
    expect(countSentences('Kwota wynosi ok. tysiąca złotych. Termin to maj.')).toBe(2);
  });

  it('does not split on English abbreviations', () => {
    expect(countSentences('Costs, e.g. travel, are excluded. Payment is due in May.')).toBe(2);
  });
});
