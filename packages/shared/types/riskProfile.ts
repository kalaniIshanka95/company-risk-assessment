export interface Director {
  name: string;
  role: string;
  appointedOn?: string;
  resignedOn?: string | null;
  nationality?: string;
  otherCompanyCount?: number;
  isSanctioned?: boolean;
}

export interface FilingRecord {
  type: string;
  date: string;
  description?: string;
  isOverdue?: boolean;
}

export interface AdverseMediaItem {
  headline: string;
  url: string;
  publishedAt?: string | null;
  sentiment: 'negative' | 'neutral' | 'positive';
  category: string;
}

export interface RiskIndicator {
  code: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export interface CompanyDetails {
  companyName: string | null;
  registrationNumber: string | null;
  companyStatus: string | null;
  incorporationDate: string | null;
  registeredAddress: string | null;
  officers: Director[];
  filings: FilingRecord[];
  hasOverdueFilings: boolean;
  lastAccountsDate: string | null;
}

export interface AIAnalysis {
  adverseMedia: AdverseMediaItem[];
  riskIndicators: RiskIndicator[];
  riskNarrative: string | null;
  confidence: { overall: number; completenessPercent: number };
}

export interface CompanyRiskProfile {
  jurisdiction: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical' | 'unknown';
  assessedAt: string;
  companyDetails: CompanyDetails | null;
  sanctions: { isOnSanctionsList: boolean; lists: string[] } | null;
  aiAnalysis: AIAnalysis | null;
}
