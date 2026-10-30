export function PageFooter() {
  return (
    <footer className="page-footer">
      <p>
        <strong>Prywatność:</strong> plik PDF jest odczytywany w Twojej przeglądarce, a do
        zewnętrznego API AI (Google Gemini) wysyłany jest tylko wyodrębniony tekst. Historia
        ostatnich analiz jest zapisywana wyłącznie w tej przeglądarce.
      </p>
      <p>
        PDF Insight · kod źródłowy na{' '}
        <a href="https://github.com/webmasterfed/pdf-insight">GitHubie</a>
      </p>
    </footer>
  );
}
