type ErrorStateProps = {
  message: string;
  // null when retrying makes no sense (e.g. wrong file type): the user picks another file instead.
  onRetry: (() => void) | null;
};

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="error-state" role="alert">
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="button" onClick={onRetry}>
          Spróbuj ponownie
        </button>
      )}
    </div>
  );
}
