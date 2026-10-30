type ErrorStateProps = {
  message: string;
  // Technical description for unexpected errors; hidden until the user expands it.
  details: string | null;
  // null when retrying makes no sense (e.g. wrong file type): the user picks another file instead.
  onRetry: (() => void) | null;
};

export function ErrorState({ message, details, onRetry }: ErrorStateProps) {
  return (
    <div className="error-state" role="alert">
      <p>{message}</p>
      {details && (
        <details className="error-state__details">
          <summary>Szczegóły techniczne</summary>
          <code>{details}</code>
        </details>
      )}
      {onRetry && (
        <button type="button" className="button" onClick={onRetry}>
          Spróbuj ponownie
        </button>
      )}
    </div>
  );
}
