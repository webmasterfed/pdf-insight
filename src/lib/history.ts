import { z } from 'zod';
import { analysisResultSchema } from '../../supabase/functions/_shared/schema.ts';
import type { KeyValueStorage } from './storage.ts';

export const HISTORY_KEY = 'pdf-insight:history:v1';
export const HISTORY_MAX = 5;

const historyEntrySchema = z.object({
  id: z.string(),
  savedAt: z.iso.datetime(),
  result: analysisResultSchema,
  pagesWithoutText: z.array(z.number().int().min(1)),
});

export type HistoryEntry = z.infer<typeof historyEntrySchema>;

// Stored data is untrusted (older app versions, manual edits): invalid entries are dropped.
export function loadHistory(storage: KeyValueStorage | null): HistoryEntry[] {
  if (!storage) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(storage.getItem(HISTORY_KEY) ?? '[]');
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .map((item) => historyEntrySchema.safeParse(item))
      .flatMap((entry) => (entry.success ? [entry.data] : []))
      .slice(0, HISTORY_MAX);
  } catch {
    return [];
  }
}

// Returns the new list even when saving fails (e.g. storage full), so the UI stays consistent.
export function addToHistory(
  storage: KeyValueStorage | null,
  current: HistoryEntry[],
  entry: HistoryEntry,
): HistoryEntry[] {
  const updated = [entry, ...current].slice(0, HISTORY_MAX);
  try {
    storage?.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // Saving history is optional; the analysis itself must still work.
  }
  return updated;
}

export function clearHistory(storage: KeyValueStorage | null): void {
  try {
    storage?.removeItem(HISTORY_KEY);
  } catch {
    // Nothing to clean up if storage is not available.
  }
}
