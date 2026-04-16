import { SourceResult, SSEEventSource } from '../assessors';
import { LLMAnalysis } from './llmAnalyser';
import {
  CompanyRegistryData,
  SanctionsResult,
  RiskIndicator,
  CompanyDetails,
  CompanyRiskProfile,
} from '../types';

function deriveRiskLevel(indicators: RiskIndicator[]): CompanyRiskProfile['riskLevel'] {
  if (indicators.length === 0) return 'low';
  if (indicators.some(i => i.severity === 'critical')) return 'critical';
  if (indicators.some(i => i.severity === 'high')) return 'high';
  if (indicators.some(i => i.severity === 'medium')) return 'medium';
  return 'low';
}

export function buildProfile(
  companyName: string,
  registrationNumber: string,
  jurisdiction: string,
  sourceResults: SourceResult[],
  analysis: LLMAnalysis | null,
): CompanyRiskProfile {
  let companyData: CompanyRegistryData | null = null;
  let sanction: SanctionsResult | null = null;
  let webResult: unknown = null;

  for (const r of sourceResults) {
    if (r.source === SSEEventSource.COMPANY_DETAILS) companyData = r.data as CompanyRegistryData;
    else if (r.source === SSEEventSource.SANCTIONS) sanction = r.data as SanctionsResult;
    else if (r.source === SSEEventSource.WEBSEARCH) webResult = r.data ?? null;
  }

  const riskIndicators = analysis?.riskIndicators ?? [];
  const completenessPercent = Math.round(
    ([companyData, sanction, webResult].filter(Boolean).length / 3) * 100
  );

  const companyDetails: CompanyDetails | null = companyData ? {
    companyName: companyData.companyName ?? companyName,
    registrationNumber: companyData.registrationNumber ?? registrationNumber,
    companyStatus: companyData.companyStatus ?? null,
    incorporationDate: companyData.incorporationDate ?? null,
    registeredAddress: companyData.registeredAddress ?? null,
    officers: companyData.officers,
    filings: companyData.filings,
    hasOverdueFilings: companyData.hasOverdueFilings,
    lastAccountsDate: companyData.lastAccountsDate ?? null,
  } : null;

  return {
    jurisdiction,
    riskLevel: analysis ? deriveRiskLevel(riskIndicators) : 'unknown',
    assessedAt: new Date().toISOString(),
    companyDetails,
    sanctions: sanction ?? null,
    aiAnalysis: analysis ? {
      adverseMedia: analysis.adverseMedia ?? [],
      riskIndicators,
      riskNarrative: analysis.riskNarrative ?? null,
      confidence: { overall: analysis.confidence?.overall ?? 0, completenessPercent },
    } : null,
  };
}
