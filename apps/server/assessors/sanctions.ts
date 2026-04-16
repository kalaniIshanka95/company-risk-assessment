import { getSanctions } from 'providers/mock';
import { RawSanctionsResult, SanctionsResult } from '../types';
import { DataSource, AssessmentContext, SSEEventSource } from './index';

export class SanctionsAssessor extends DataSource<RawSanctionsResult, SanctionsResult> {
  readonly name = 'Sanctions Screening';
  readonly source = SSEEventSource.SANCTIONS;

  protected map(raw: RawSanctionsResult): SanctionsResult {
    return {
      isOnSanctionsList: raw.data.total_hits > 0,
      lists: raw.data.hits.flatMap((hit) => hit.doc.sources),
    };
  }

  protected async fetch(context: AssessmentContext): Promise<RawSanctionsResult> {
    return getSanctions(context.companyName, context.registrationNumber, context.jurisdiction);
  }
}
