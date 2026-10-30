export function AiNotice() {
  return (
    <p className="ai-notice">
      <strong>Uwaga:</strong> tekst z wybranego pliku zostanie wysłany do zewnętrznego API AI
      (Google Gemini) w celu analizy. W darmowym planie Google może wykorzystywać przesłane dane do
      ulepszania swoich usług, dlatego nie wysyłaj dokumentów z danymi poufnymi ani osobowymi.
    </p>
  );
}
