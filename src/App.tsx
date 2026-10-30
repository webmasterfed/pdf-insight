import { useState } from 'react';
import { UploadArea } from './components/UploadArea.tsx';
import { extractPdfText, PdfError } from './lib/extractText.ts';
import { validateFile } from './lib/validateFile.ts';

type AppState =
  | { status: 'idle' }
  | { status: 'extracting'; fileName: string }
  | { status: 'extracted'; fileName: string; pages: number; characters: number }
  | { status: 'error'; message: string };

export function App() {
  const [state, setState] = useState<AppState>({ status: 'idle' });

  async function handleFile(file: File) {
    const validation = await validateFile(file);
    if (!validation.ok) {
      setState({ status: 'error', message: validation.message });
      return;
    }

    setState({ status: 'extracting', fileName: file.name });
    try {
      const { text, pages } = await extractPdfText(await file.arrayBuffer());
      setState({ status: 'extracted', fileName: file.name, pages, characters: text.length });
    } catch (error) {
      const message = error instanceof PdfError ? error.message : new PdfError('unknown').message;
      setState({ status: 'error', message });
    }
  }

  return (
    <main className="container">
      <h1>PDF Insight</h1>
      <p>Wgraj dokument PDF, a AI przygotuje streszczenie i dane w formacie JSON.</p>

      <UploadArea
        disabled={state.status === 'extracting'}
        onFileSelected={(file) => {
          void handleFile(file);
        }}
      />

      <div aria-live="polite" className="status">
        {state.status === 'extracting' && <p>Odczytywanie tekstu z pliku {state.fileName}…</p>}
        {state.status === 'extracted' && (
          <p>
            Odczytano {state.fileName}: stron {state.pages}, znaków {state.characters}.
          </p>
        )}
        {state.status === 'error' && (
          <p role="alert" className="status--error">
            {state.message}
          </p>
        )}
      </div>
    </main>
  );
}
