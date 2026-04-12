import { IProvider, CompanyRiskProfile, RiskIndicator } from '../types';
import { analyseWithLLM } from './llmAnalyser';

export type SSEEvent =
  | { type: 'status'; message: string }
  | { type: 'result'; data: CompanyRiskProfile }
  | { type: 'error'; message: string };

// ─── Deterministic riskLevel derived from indicators ─────────────────────────

const SEVERITY_RANK = { critical: 4, high: 3, medium: 2, low: 1 } as const;

function deriveRiskLevel(indicators: RiskIndicator[]): CompanyRiskProfile['riskLevel'] {
  if (indicators.length === 0) return 'low';
  const worst = indicators.reduce((max, ind) =>
    SEVERITY_RANK[ind.severity] > SEVERITY_RANK[max.severity] ? ind : max
  );
  return worst.severity;
}

// ─── Deterministic completeness score ────────────────────────────────────────

const COMPLETENESS_FIELDS: (keyof CompanyRiskProfile)[] = [
  'companyName',
  'registrationNumber',
  'registeredAddress',
  'incorporationDate',
  'companyStatus',
  'directors',
  'filings',
  'lastAccountsDate',
  'sanctions',
];

function computeCompleteness(profile: Partial<CompanyRiskProfile>): number {
  const filled = COMPLETENESS_FIELDS.filter(field => {
    const val = profile[field];
    if (val === null || val === undefined) return false;
    if (Array.isArray(val) && val.length === 0) return false;
    return true;
  }).length;
  return Math.round((filled / COMPLETENESS_FIELDS.length) * 100);
}

// ─── Main assessor ────────────────────────────────────────────────────────────

export async function assessCompanyRisk(
  provider: IProvider,
  companyId: string,
  jurisdiction: string,
  onEvent: (event: SSEEvent) => void
): Promise<void> {
  // Step 1 — fetch company details from Companies House
  onEvent({ type: 'status', message: 'Fetching company details from Companies House...' });
  const companyDetails = await provider.getCompanyDetails(companyId, jurisdiction);

  if (!companyDetails) {
    onEvent({ type: 'error', message: 'Company not found' });
    return;
  }

  // Step 2 — sanctions screening (ComplyAdvantage)
  onEvent({ type: 'status', message: 'Running sanctions screening...' });
  const sanctionsResult = await provider.getSanctions(companyId, jurisdiction);

  // Step 3 — web search for adverse media
  onEvent({ type: 'status', message: 'Searching for adverse media and news...' });
  const webResults = await provider.getWebSearch(companyId, jurisdiction);

  // Step 4 — LLM structures all raw data + identifies risk flags
  onEvent({ type: 'status', message: 'Analysing with AI...' });
  const analysis = await analyseWithLLM(
    companyId,
    jurisdiction,
    companyDetails,
    sanctionsResult,
    webResults
  );

  // Step 5 — override riskLevel and completeness with deterministic code
  const completenessPercent = computeCompleteness({ ...analysis, confidence: { ...analysis.confidence, completenessPercent: 0 } });
  const riskLevel = deriveRiskLevel(analysis.riskIndicators);

  const finalProfile: CompanyRiskProfile = {
    companyId,
    jurisdiction,
    companyName: analysis.companyName,
    registrationNumber: analysis.registrationNumber,
    registeredAddress: analysis.registeredAddress,
    incorporationDate: analysis.incorporationDate,
    companyStatus: analysis.companyStatus,
    sicCode: analysis.sicCode,
    sicDescription: analysis.sicDescription,
    directors: analysis.directors,
    filings: analysis.filings,
    hasOverdueFilings: analysis.hasOverdueFilings,
    lastAccountsDate: analysis.lastAccountsDate,
    adverseMedia: analysis.adverseMedia,
    sanctions: analysis.sanctions,
    riskIndicators: analysis.riskIndicators,
    riskNarrative: analysis.riskNarrative,
    riskLevel,
    confidence: {
      overall: analysis.confidence.overall,
      completenessPercent,
    },
    assessedAt: new Date().toISOString(),
  };

  onEvent({ type: 'result', data: finalProfile });
}
