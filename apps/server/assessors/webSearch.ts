import { getWebSearch } from 'providers/mock';
import { RawWebSearchResult } from '../types';
import { DataSource, AssessmentContext, SSEEventSource } from './index';

export class WebSearchAssessor extends DataSource<RawWebSearchResult[], RawWebSearchResult[]> {
  readonly name = 'Web Search';
  readonly source = SSEEventSource.WEBSEARCH;

  protected map(raw: RawWebSearchResult[]): RawWebSearchResult[] {
    return raw;
  }

  protected async fetch(context: AssessmentContext): Promise<RawWebSearchResult[]> {
    return getWebSearch(context.companyName, context.registrationNumber, context.jurisdiction);
  }
}
