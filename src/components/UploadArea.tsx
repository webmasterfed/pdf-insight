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
      <p className="upload-area__title">Przeciągnij i upuść plik PDF tutaj</p>
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
