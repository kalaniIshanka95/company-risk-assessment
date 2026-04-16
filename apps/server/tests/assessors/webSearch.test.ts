import { describe, it, expect } from 'vitest';
import { WebSearchAssessor } from '../../assessors/webSearch';
import { RawWebSearchResult } from '../../types';

const assessor = new WebSearchAssessor();
const map = (raw: RawWebSearchResult[]) => (assessor as any).map(raw);

describe('WebSearchAssessor.map', () => {
  it('returns an empty array when there are no results', () => {
    expect(map([])).toEqual([]);
  });

  it('passes results through unchanged', () => {
    const raw: RawWebSearchResult[] = [
      { title: 'Fraud case', snippet: 'Company linked to fraud', url: 'https://example.com/1', published_date: '2024-01-01' },
      { title: 'Expansion news', snippet: 'Company opens new office', url: 'https://example.com/2' },
    ];
    expect(map(raw)).toEqual(raw);
  });

  it('preserves optional published_date when present', () => {
    const raw: RawWebSearchResult[] = [{ title: 'News', snippet: 'Snippet', url: 'https://example.com', published_date: '2023-06-15' }];
    expect(map(raw)[0].published_date).toBe('2023-06-15');
  });
});
