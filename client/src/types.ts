export interface CompanySearchItem {
  companyId: string;
  name: string;
  number: string;
  numbers: string[];
  jurisdiction: string;
  status: 'active' | 'dissolved' | 'dormant' | 'liquidation' | 'unknown';
  incorporationDate?: string;
  address?: string;
}

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
  publishedAt?: string;
  sentiment: 'negative' | 'neutral' | 'positive';
  category: string;
}

export interface RiskIndicator {
  code: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export interface CompanyRiskProfile {
  companyId: string;
  companyName: string | null;
  registrationNumber: string | null;
  jurisdiction: string;
  registeredAddress: string | null;
  incorporationDate: string | null;
  companyStatus: string | null;
  sicCode: string | null;
  sicDescription: string | null;
  directors: Director[];
  filings: FilingRecord[];
  hasOverdueFilings: boolean;
  lastAccountsDate: string | null;
  adverseMedia: AdverseMediaItem[];
  sanctions: { isOnSanctionsList: boolean; lists: string[] };
  riskIndicators: RiskIndicator[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical' | 'unknown';
  riskNarrative: string | null;
  confidence: { overall: number; completenessPercent: number };
  assessedAt: string;
}

export type SSEEvent =
  | { type: 'status'; message: string }
  | { type: 'result'; data: CompanyRiskProfile }
  | { type: 'error'; message: string }
  | { type: 'done' };
