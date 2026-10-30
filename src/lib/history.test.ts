import { describe, expect, it } from 'vitest';
import type { AnalysisResult } from '../../supabase/functions/_shared/schema.ts';
import {
  addToHistory,
  clearHistory,
  HISTORY_KEY,
  HISTORY_MAX,
  loadHistory,
  type HistoryEntry,
  type HistoryStorage,
} from './history.ts';

function memoryStorage(initial: Record<string, string> = {}): HistoryStorage {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
    removeItem: (key) => {
      data.delete(key);
    },
  };
}

const result: AnalysisResult = {
  document: {
    fileName: 'umowa.pdf',
    pages: 1,
    language: 'pl',
    type: 'umowa',
    title: null,
    date: null,
  },
  summary: 'Dokument jest umową serwisową.',
  keyPoints: [],
  entities: { organizations: [], people: [] },
  amounts: [],
  dates: [],
  keywords: [],
};

function entry(id: string): HistoryEntry {
  return { id, savedAt: '2026-10-30T12:00:00.000Z', result, pagesWithoutText: [] };
}

describe('history', () => {
  it('returns an empty list when nothing is stored or storage is unavailable', () => {
    expect(loadHistory(memoryStorage())).toEqual([]);
    expect(loadHistory(null)).toEqual([]);
  });

  it('saves the newest entry first and keeps at most 5', () => {
    const storage = memoryStorage();
    let list: HistoryEntry[] = [];
    for (let i = 1; i <= 7; i++) {
      list = addToHistory(storage, list, entry(String(i)));
    }
    expect(list.map((e) => e.id)).toEqual(['7', '6', '5', '4', '3']);
    expect(loadHistory(storage)).toHaveLength(HISTORY_MAX);
  });

  it('ignores corrupted JSON in storage', () => {
    expect(loadHistory(memoryStorage({ [HISTORY_KEY]: '{not json' }))).toEqual([]);
  });

  it('drops stored entries that no longer match the schema', () => {
    const broken = { ...entry('bad'), result: { ...result, summary: 42 } };
    const storage = memoryStorage({ [HISTORY_KEY]: JSON.stringify([entry('good'), broken]) });
    expect(loadHistory(storage).map((e) => e.id)).toEqual(['good']);
  });

  it('still returns the new list when saving throws (e.g. storage full)', () => {
    const full: HistoryStorage = {
      ...memoryStorage(),
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    };
    expect(addToHistory(full, [], entry('1')).map((e) => e.id)).toEqual(['1']);
  });

  it('clears the stored history', () => {
    const storage = memoryStorage({ [HISTORY_KEY]: JSON.stringify([entry('1')]) });
    clearHistory(storage);
    expect(loadHistory(storage)).toEqual([]);
  });
});
