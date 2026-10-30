// Polish needs singular and plural forms: "Strona 11 nie zawiera…" / "Strony 3, 11 nie zawierają…".
export function formatPagesWithoutTextWarning(pagesWithoutText: number[]): string | null {
  if (pagesWithoutText.length === 0) {
    return null;
  }
  const list = pagesWithoutText.join(', ');
  if (pagesWithoutText.length === 1) {
    return `Strona ${list} nie zawiera warstwy tekstowej (prawdopodobnie skan) i została pominięta. Wyniki mogą być niepełne.`;
  }
  return `Strony ${list} nie zawierają warstwy tekstowej (prawdopodobnie skan) i zostały pominięte. Wyniki mogą być niepełne.`;
}
