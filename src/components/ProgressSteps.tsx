import './ProgressSteps.css';

export type AnalysisStage = 'extracting' | 'analyzing' | 'validating';

// Each step maps to a real app state; "sending" and "AI analysis" are one step because the
// browser gives no signal between the end of the upload and the start of the AI work.
const STEPS: { stage: AnalysisStage; label: string }[] = [
  { stage: 'extracting', label: 'Odczyt tekstu' },
  { stage: 'analyzing', label: 'Wysyłanie i analiza AI' },
  { stage: 'validating', label: 'Walidacja wyników' },
];

type ProgressStepsProps = {
  current: AnalysisStage;
};

export function ProgressSteps({ current }: ProgressStepsProps) {
  const currentIndex = STEPS.findIndex((step) => step.stage === current);
  return (
    <ol className="progress" aria-label="Postęp analizy">
      {STEPS.map((step, index) => {
        const status = index < currentIndex ? 'done' : index === currentIndex ? 'active' : 'todo';
        return (
          <li
            key={step.stage}
            className={`progress__step progress__step--${status}`}
            aria-current={status === 'active' ? 'step' : undefined}
          >
            <span className="progress__marker" aria-hidden="true">
              {status === 'done' ? '✓' : index + 1}
            </span>
            {step.label}
            {status === 'done' && <span className="visually-hidden"> (zakończono)</span>}
          </li>
        );
      })}
    </ol>
  );
}
