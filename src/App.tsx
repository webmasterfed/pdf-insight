import { useRef, useState } from 'react';
import { AnalysisApiError, requestAnalysis } from './api/analyze.ts';
import { ERROR_MESSAGES } from './api/errorMessages.ts';
import { AiNotice } from './components/AiNotice.tsx';
import { ErrorState } from './components/ErrorState.tsx';
import { HistoryList } from './components/HistoryList.tsx';
import { LoadingState } from './components/LoadingState.tsx';
import { PageFooter } from './components/PageFooter.tsx';
import { PageHeader } from './components/PageHeader.tsx';
import { ResultView } from './components/ResultView.tsx';
import { UploadArea } from './components/UploadArea.tsx';
import { describeError, extractPdfText, PdfError } from './lib/extractText.ts';
import { addToHistory, clearHistory, loadHistory, type HistoryEntry } from './lib/history.ts';
import { formatPagesWithoutTextWarning } from './lib/pageWarning.ts';
import { getBrowserStorage } from './lib/storage.ts';
import { validateFile } from './lib/validateFile.ts';
import type { AnalyzeRequest } from '../supabase/functions/_shared/api.ts';
import type { AnalysisResult } from '../supabase/functions/_shared/schema.ts';

type AppState =
  | { status: 'idle'; notice: string | null }
  | { status: 'extracting'; fileName: string }
  | { status: 'analyzing'; fileName: string; validating: boolean }
  | { status: 'done'; result: AnalysisResult; pagesWithoutText: number[] }
  // "request" is kept when the text was already extracted, so a retry skips the PDF step.
  | { status: 'error'; message: string; details: string | null; request: AnalyzeRequest | null };

const storage = getBrowserStorage();

export function App() {
  const [state, setState] = useState<AppState>({ status: 'idle', notice: null });
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory(storage));
  const abortControllerRef = useRef<AbortController | null>(null);

  async function analyze(request: AnalyzeRequest) {
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setState({ status: 'analyzing', fileName: request.fileName, validating: false });
    try {
      const result = await requestAnalysis(request, controller.signal, () => {
        setState({ status: 'analyzing', fileName: request.fileName, validating: true });
      });
      setState({ status: 'done', result, pagesWithoutText: request.pagesWithoutText });
      setHistory(
        addToHistory(storage, history, {
          id: crypto.randomUUID(),
          savedAt: new Date().toISOString(),
          result,
          pagesWithoutText: request.pagesWithoutText,
        }),
      );
    } catch (error) {
      if (controller.signal.aborted) {
        setState({ status: 'idle', notice: 'Analiza została anulowana.' });
        return;
      }
      const code = error instanceof AnalysisApiError ? error.code : 'internal_error';
      setState({ status: 'error', message: ERROR_MESSAGES[code], details: null, request });
    } finally {
      abortControllerRef.current = null;
    }
  }

  async function handleFile(file: File) {
    const validation = await validateFile(file);
    if (!validation.ok) {
      setState({ status: 'error', message: validation.message, details: null, request: null });
      return;
    }

    setState({ status: 'extracting', fileName: file.name });
    let request: AnalyzeRequest;
    try {
      const { text, pages, pagesWithoutText } = await extractPdfText(await file.arrayBuffer());
      request = { text, fileName: file.name, pages, pagesWithoutText };
    } catch (error) {
      const pdfError =
        error instanceof PdfError ? error : new PdfError('unknown', describeError(error, null));
      setState({
        status: 'error',
        message: pdfError.message,
        details: pdfError.details,
        request: null,
      });
      return;
    }
    await analyze(request);
  }

  const isBusy = state.status === 'extracting' || state.status === 'analyzing';
  const retryRequest = state.status === 'error' ? state.request : null;
  const pageWarning =
    state.status === 'done' ? formatPagesWithoutTextWarning(state.pagesWithoutText) : null;

  return (
    <div className="container">
      <PageHeader />
      <main>
        {state.status !== 'done' && (
          <>
            <UploadArea
              disabled={isBusy}
              onFileSelected={(file) => {
                void handleFile(file);
              }}
            />
            <AiNotice />
          </>
        )}

        <div aria-live="polite" className="status">
          {state.status === 'idle' && state.notice && <p>{state.notice}</p>}
          {state.status === 'extracting' && (
            <LoadingState
              stage="extracting"
              title="Odczytuję tekst z pliku…"
              detail={state.fileName}
            />
          )}
          {state.status === 'analyzing' && (
            <LoadingState
              stage={state.validating ? 'validating' : 'analyzing'}
              title="Analizuję dokument…"
              detail={`${state.fileName} · zwykle trwa to kilka sekund`}
              onCancel={() => abortControllerRef.current?.abort()}
            />
          )}
          {state.status === 'error' && (
            <ErrorState
              message={state.message}
              details={state.details}
              onRetry={
                retryRequest
                  ? () => {
                      void analyze(retryRequest);
                    }
                  : null
              }
            />
          )}
        </div>

        {(state.status === 'idle' || state.status === 'error') && (
          <HistoryList
            entries={history}
            onOpen={(entry) => {
              setState({
                status: 'done',
                result: entry.result,
                pagesWithoutText: entry.pagesWithoutText,
              });
            }}
            onClear={() => {
              clearHistory(storage);
              setHistory([]);
            }}
          />
        )}

        {state.status === 'done' && (
          <ResultView
            result={state.result}
            warning={pageWarning}
            onNewDocument={() => {
              setState({ status: 'idle', notice: null });
            }}
          />
        )}
      </main>
      <PageFooter />
    </div>
  );
}
