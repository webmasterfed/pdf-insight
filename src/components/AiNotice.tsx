export function AiNotice() {
  return (
    <p className="ai-notice">
      <svg className="ai-notice__icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        <circle cx="10" cy="10" r="8.5" />
        <path d="M10 9v5M10 6.2v.1" />
      </svg>
      <span>
        Tekst z pliku zostanie wysłany do zewnętrznego API AI (Google Gemini). Nie wysyłaj danych
        poufnych.
      </span>
    </p>
  );
}
