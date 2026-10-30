type LoadingStateProps = {
  message: string;
  onCancel?: () => void;
};

export function LoadingState({ message, onCancel }: LoadingStateProps) {
  return (
    <div className="loading-state">
      <span className="spinner" aria-hidden="true" />
      <p>{message}</p>
      {onCancel && (
        <button type="button" className="button button--secondary" onClick={onCancel}>
          Anuluj
        </button>
      )}
    </div>
  );
}
