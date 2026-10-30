export function PageHeader() {
  return (
    <header className="page-header">
      <div className="brand">
        <svg className="brand__logo" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
          <rect width="32" height="32" rx="7" fill="currentColor" />
          <path d="M10 7h8.5L23 11.5V25H10z" fill="#ffffff" />
          <path
            d="M13 16h7M13 19h7M13 22h4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
        <h1>PDF Insight</h1>
      </div>
      <p className="page-header__lead">
        Wgraj dokument PDF, a AI przygotuje streszczenie, najważniejsze informacje i dane w formacie
        JSON do pobrania.
      </p>
      <ol className="steps" aria-label="Jak to działa">
        <li>Wgraj PDF</li>
        <li>AI analizuje tekst</li>
        <li>Przejrzyj i pobierz JSON</li>
      </ol>
    </header>
  );
}
