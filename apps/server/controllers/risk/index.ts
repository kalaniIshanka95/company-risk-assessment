import { Request, Response } from 'express';
import { RiskBody } from './validateRiskInput';
import { DataSource, AssessmentContext, SourceResult } from '../../assessors';
import { SanctionsAssessor } from '../../assessors/sanctions';
import { CompanyDetailsAssessor } from '../../assessors/companyDetails';
import { WebSearchAssessor } from '../../assessors/webSearch';
import { analyseWithLLM } from '../../services/llmAnalyser';
import { buildProfile } from '../../services/profileBuilder';
import { SSEEventStatus, SSEEventSource } from '@/packages/shared/types/serverSendEvents';

const sources: DataSource[] = [
  new CompanyDetailsAssessor(),
  new SanctionsAssessor(),
  new WebSearchAssessor(),
  // add new datasources
];

export const companyRiskAssessHandler = async (req: Request, res: Response): Promise<void> => {
  const { companyId, registrationNumber, companyName, jurisdiction } = req.query as RiskBody;

  // SSE headers — keeps the connection open so the client receives events as they arrive.
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const send = (data: object) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const context: AssessmentContext = { companyId, companyName, registrationNumber, jurisdiction };
  const sourceResults: SourceResult[] = [];

  try {
    // Run all data sources in parallel. Each source has its own try/catch so one
    // failure doesn't block the others — the client gets a per-source error event instead.
    await Promise.all(
      sources.map(async (source) => {
        try {
          const result = await source.collect(context);
          sourceResults.push(result);
          send({ status: SSEEventStatus.SUCCESS, source: source.source });
        } catch (err) {
          console.error(`Data source "${source.name}" failed:`, err);
          send({ status: SSEEventStatus.ERROR, source: source.source, message: `${source.name} failed` });
        }
      })
    );

    // If every source failed there's nothing meaningful to analyse.
    if (!sourceResults.length) {
      send({ status: SSEEventStatus.ERROR, message: 'Not one data source found to start the AI Analysis' });
      res.end();
      return;
    }

    const analysis = await analyseWithLLM(sourceResults);

    if (!analysis) {
      send({ status: SSEEventStatus.ERROR, source: SSEEventSource.AI_ANALYSIS, message: 'AI analysis did not complete — showing available data only' });
    } else {
      send({ status: SSEEventStatus.SUCCESS, source: SSEEventSource.AI_ANALYSIS });
    }

    const profile = buildProfile(companyName, registrationNumber, jurisdiction, sourceResults, analysis);
    send({ status: SSEEventStatus.SUCCESS, source: SSEEventSource.AI_ANALYSIS, data: profile });
  } catch (err) {
    console.error(err);
    send({ status: SSEEventStatus.ERROR, message: 'An unexpected error occurred' });
  } finally {
    res.end();
  }
};
