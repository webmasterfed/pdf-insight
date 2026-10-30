import { ProgressSteps, type AnalysisStage } from './ProgressSteps.tsx';

type LoadingStateProps = {
  stage: AnalysisStage;
  title: string;
  detail: string;
  onCancel?: () => void;
};

export function LoadingState({ stage, title, detail, onCancel }: LoadingStateProps) {
  return (
    <div className="loading-state">
      <span className="spinner" aria-hidden="true" />
      <div className="loading-state__text">
        <p className="loading-state__title">{title}</p>
        <p className="muted">{detail}</p>
      </div>
      {onCancel && (
        <button type="button" className="button button--secondary" onClick={onCancel}>
          Anuluj
        </button>
      )}
      <ProgressSteps current={stage} />
    </div>
  );
}
