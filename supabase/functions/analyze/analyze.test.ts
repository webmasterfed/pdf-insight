import { describe, expect, it } from 'vitest';
import { parseModelOutput } from './analyze.ts';
import { buildUserMessage } from './prompt.ts';

const request = { text: 'Umowa serwisowa.', fileName: 'umowa.pdf', pages: 4 };

const modelAnswer = {
  document: {
    fileName: 'invented-name.pdf',
    pages: 99,
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

describe('parseModelOutput', () => {
  it('accepts valid JSON and replaces fileName and pages with the real values', () => {
    const outcome = parseModelOutput(JSON.stringify(modelAnswer), request);
    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      expect(outcome.result.document.fileName).toBe('umowa.pdf');
      expect(outcome.result.document.pages).toBe(4);
    }
  });

  it('rejects text that is not JSON', () => {
    expect(parseModelOutput('Oto analiza: {...}', request)).toEqual({
      ok: false,
      problems: 'the answer was not valid JSON',
    });
  });

  it('rejects JSON that breaks the schema and names the problem', () => {
    const invalid = { ...modelAnswer, document: { ...modelAnswer.document, type: 'list' } };
    const outcome = parseModelOutput(JSON.stringify(invalid), request);
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) {
      expect(outcome.problems).toContain('document.type');
    }
  });
});

describe('buildUserMessage', () => {
  it('wraps the document in markers that use the random document ID', () => {
    const message = buildUserMessage(request, 'abc-123', null);
    expect(message).toContain('<document-abc-123>\nUmowa serwisowa.\n</document-abc-123>');
  });

  it('adds the validation problems on the retry', () => {
    const message = buildUserMessage(request, 'abc-123', 'summary: Required');
    expect(message).toContain('rejected by validation (summary: Required)');
  });
});
