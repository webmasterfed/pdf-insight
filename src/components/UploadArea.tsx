import { useId, useState, type ChangeEvent, type DragEvent } from 'react';

type UploadAreaProps = {
  onFileSelected: (file: File) => void;
  disabled: boolean;
};

export function UploadArea({ onFileSelected, disabled }: UploadAreaProps) {
  const inputId = useId();
  const hintId = useId();
  const [isDragging, setIsDragging] = useState(false);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
    // Reset so choosing the same file again still triggers a change event.
    event.target.value = '';
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    // Without preventDefault the browser would open the dropped PDF itself.
    event.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (!disabled && file) {
      onFileSelected(file);
    }
  }

  return (
    <div
      className={`upload-area${isDragging ? ' upload-area--dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={() => {
        setIsDragging(false);
      }}
      onDrop={handleDrop}
    >
      <svg className="upload-area__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          d="M12 16V4m0 0-4.5 4.5M12 4l4.5 4.5M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <p className="upload-area__title">
        {isDragging ? 'Upuść plik, aby rozpocząć analizę' : 'Przeciągnij i upuść plik PDF tutaj'}
      </p>
      <p className="upload-area__or">lub</p>
      {/* The real file input stays focusable for the keyboard; the label is its visible button. */}
      <input
        id={inputId}
        className="visually-hidden"
        type="file"
        accept="application/pdf,.pdf"
        aria-describedby={hintId}
        disabled={disabled}
        onChange={handleChange}
      />
      <label htmlFor={inputId} className={`button${disabled ? ' button--disabled' : ''}`}>
        Wybierz plik z dysku
      </label>
      <p id={hintId} className="upload-area__hint">
        Tylko pliki PDF z warstwą tekstową, maksymalnie 10 MB.
      </p>
    </div>
  );
}
