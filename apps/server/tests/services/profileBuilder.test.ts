import { describe, it, expect } from 'vitest';
import { SourceResult, SSEEventSource } from '../../assessors';
import { buildProfile } from '../../services/profileBuilder';
import { LLMAnalysis } from '../../services/llmAnalyser';
import { CompanyRegistryData, SanctionsResult } from '../../types';

const baseLLMAnalysis: LLMAnalysis = {
  adverseMedia: [],
  riskIndicators: [],
  riskNarrative: 'No significant risk identified.',
  confidence: { overall: 80 },
};

const baseCompanyData: CompanyRegistryData = {
  companyName: 'ACME LTD',
  registrationNumber: '12345678',
  companyStatus: 'active',
  incorporationDate: '2015-01-01',
  registeredAddress: '1 Test Street, London',
  officers: [],
  filings: [],
  hasOverdueFilings: false,
  lastAccountsDate: '2024-01-01',
};

const baseSanctions: SanctionsResult = {
  isOnSanctionsList: false,
  lists: [],
};

function makeSourceResults(cd: CompanyRegistryData | null, san: SanctionsResult | null): SourceResult[] {
  const results: SourceResult[] = [];
  if (cd) results.push({ name: 'Company House', source: SSEEventSource.COMPANY_DETAILS, data: cd });
  if (san) results.push({ name: 'Sanctions Screening', source: SSEEventSource.SANCTIONS, data: san });
  return results;
}

describe('buildProfile', () => {
  describe('riskLevel derivation', () => {
    it('returns low when there are no risk indicators', () => {
      const profile = buildProfile('ACME LTD', '12345678', 'GB', makeSourceResults(baseCompanyData, baseSanctions), baseLLMAnalysis);
      expect(profile.riskLevel).toBe('low');
    });

    it('returns critical when any indicator is critical', () => {
      const analysis: LLMAnalysis = { ...baseLLMAnalysis, riskIndicators: [{ code: 'SANCTIONS_HIT', severity: 'critical', description: 'On sanctions list' }] };
      const profile = buildProfile('ACME LTD', '12345678', 'GB', makeSourceResults(baseCompanyData, baseSanctions), analysis);
      expect(profile.riskLevel).toBe('critical');
    });

    it('returns high when highest indicator is high', () => {
      const analysis: LLMAnalysis = { ...baseLLMAnalysis, riskIndicators: [{ code: 'COMPANY_INACTIVE', severity: 'high', description: 'Dissolved' }, { code: 'OVERDUE_FILINGS', severity: 'medium', description: 'Overdue' }] };
      const profile = buildProfile('ACME LTD', '12345678', 'GB', makeSourceResults(baseCompanyData, baseSanctions), analysis);
      expect(profile.riskLevel).toBe('high');
    });

    it('returns medium when highest indicator is medium', () => {
      const analysis: LLMAnalysis = { ...baseLLMAnalysis, riskIndicators: [{ code: 'OVERDUE_FILINGS', severity: 'medium', description: 'Overdue' }] };
      const profile = buildProfile('ACME LTD', '12345678', 'GB', makeSourceResults(baseCompanyData, baseSanctions), analysis);
      expect(profile.riskLevel).toBe('medium');
    });
  });

  describe('companyDetails mapping', () => {
    it('maps registry data onto companyDetails', () => {
      const profile = buildProfile('ACME LTD', '12345678', 'GB', makeSourceResults(baseCompanyData, baseSanctions), baseLLMAnalysis);
      expect(profile.companyDetails).toMatchObject({
        companyName: 'ACME LTD',
        registrationNumber: '12345678',
        companyStatus: 'active',
      });
    });

    it('falls back to params when registry returns null fields', () => {
      const cd: CompanyRegistryData = { ...baseCompanyData, companyName: null, registrationNumber: null };
      const profile = buildProfile('FALLBACK NAME', 'FALLBACK-NUM', 'GB', makeSourceResults(cd, baseSanctions), baseLLMAnalysis);
      expect(profile.companyDetails?.companyName).toBe('FALLBACK NAME');
      expect(profile.companyDetails?.registrationNumber).toBe('FALLBACK-NUM');
    });

    it('sets companyDetails to null when no Company House result', () => {
      const profile = buildProfile('ACME LTD', '12345678', 'GB', makeSourceResults(null, baseSanctions), baseLLMAnalysis);
      expect(profile.companyDetails).toBeNull();
    });
  });

  describe('completenessPercent', () => {
    it('is 100 when all three data sources are present', () => {
      const sources = [...makeSourceResults(baseCompanyData, baseSanctions), { name: 'Web Search', source: SSEEventSource.WEBSEARCH, data: [] }];
      const profile = buildProfile('ACME LTD', '12345678', 'GB', sources, baseLLMAnalysis);
      expect(profile.aiAnalysis?.confidence.completenessPercent).toBe(100);
    });

    it('is 67 when web search is missing', () => {
      const profile = buildProfile('ACME LTD', '12345678', 'GB', makeSourceResults(baseCompanyData, baseSanctions), baseLLMAnalysis);
      expect(profile.aiAnalysis?.confidence.completenessPercent).toBe(67);
    });

    it('is 0 when no data sources returned results', () => {
      const profile = buildProfile('ACME LTD', '12345678', 'GB', makeSourceResults(null, null), baseLLMAnalysis);
      expect(profile.aiAnalysis?.confidence.completenessPercent).toBe(0);
    });
  });

  describe('sanctions', () => {
    it('sets sanctions from source result', () => {
      const san: SanctionsResult = { isOnSanctionsList: true, lists: ['GB HMT'] };
      const profile = buildProfile('ACME LTD', '12345678', 'GB', makeSourceResults(baseCompanyData, san), baseLLMAnalysis);
      expect(profile.sanctions).toEqual({ isOnSanctionsList: true, lists: ['GB HMT'] });
    });

    it('sets sanctions to null when no sanctions result', () => {
      const profile = buildProfile('ACME LTD', '12345678', 'GB', makeSourceResults(baseCompanyData, null), baseLLMAnalysis);
      expect(profile.sanctions).toBeNull();
    });
  });
});
