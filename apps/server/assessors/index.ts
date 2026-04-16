import { SSEEventSource } from '@/packages/shared/types/serverSendEvents';

export { SSEEventSource };

export interface AssessmentContext {
  companyId: string;
  companyName: string;
  registrationNumber: string;
  jurisdiction: string;
}

export type SourceResult = { name: string; source: SSEEventSource; data: unknown };

// Base class for all data sources used in risk assessment.
// Each subclass is responsible for fetching and normalising data from one specific source.
// The controller only calls collect() — fetch() and map() are internal implementation details.
export abstract class DataSource<RawData = unknown, NormalizedData = unknown> {
  abstract readonly name: string;
  abstract readonly source: SSEEventSource;

  protected abstract map(raw: RawData): NormalizedData;
  protected abstract fetch(context: AssessmentContext): Promise<RawData>;

  async collect(context: AssessmentContext): Promise<SourceResult> {
    const raw = await this.fetch(context);
    const data = this.map(raw);
    return { name: this.name, source: this.source, data };
  }
}
