// ─── Search ───────────────────────────────────────────────────────────────────

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

export interface CompanySearchResponse {
  data: CompanySearchItem[];
  total: number;
  metadata: { search: 'index' | 'deep' };
}

// ─── Raw source types (what each provider returns in their own format) ─────────

// Companies House API format
export interface RawCompanyDetails {
  company_name: string;
  company_number: string;
  company_status: string;
  date_of_creation: string;
  sic_codes: string[];
  registered_office_address: {
    address_line_1?: string;
    address_line_2?: string;
    locality?: string;
    postal_code?: string;
    country?: string;
  };
  officers: Array<{
    name: string;
    officer_role: string;
    appointed_on?: string;
    resigned_on?: string;
    nationality?: string;
    country_of_residence?: string;
    occupation?: string;
    number_of_directorships?: number;
  }>;
  filing_history: Array<{
    type: string;
    date: string;
    description?: string;
    overdue?: boolean;
  }>;
}

// ComplyAdvantage sanctions screening format
export interface RawSanctionsResult {
  data: {
    total_hits: number;
    hits: Array<{
      doc: {
        name: string;
        entity_type: string;
        sources: string[];
        types: string[];
        aka: string[];
      };
      match_types: string[];
    }>;
  };
}

// Web search result (e.g. Brave Search / Google)
export interface RawWebSearchResult {
  title: string;
  snippet: string;
  url: string;
  published_date?: string;
}

// ─── Risk Assessment output schema ────────────────────────────────────────────

export interface RiskAssessmentRequest {
  companyId?: string;
  registrationNumber?: string;
  jurisdiction?: string;
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
  category: 'fraud' | 'litigation' | 'regulatory' | 'insolvency' | 'reputational' | 'other';
}

export interface SanctionsResult {
  isOnSanctionsList: boolean;
  lists: string[];
}

export interface RiskIndicator {
  code: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export interface ConfidenceScore {
  overall: number;
  completenessPercent: number;
}

export interface CompanyRiskProfile {
  companyId: string;
  companyName: string | null;
  registrationNumber: string | null;
  jurisdiction: string;
  registeredAddress: string | null;
  incorporationDate: string | null;
  companyStatus: 'active' | 'dissolved' | 'dormant' | 'liquidation' | 'unknown' | null;
  sicCode: string | null;
  sicDescription: string | null;
  directors: Director[];
  filings: FilingRecord[];
  hasOverdueFilings: boolean;
  lastAccountsDate: string | null;
  adverseMedia: AdverseMediaItem[];
  sanctions: SanctionsResult;
  riskIndicators: RiskIndicator[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical' | 'unknown';
  riskNarrative: string | null;
  confidence: ConfidenceScore;
  assessedAt: string;
}

// ─── Provider interface ───────────────────────────────────────────────────────

export interface IProvider {
  searchCompanies(query: string, jurisdiction: string): Promise<CompanySearchItem[]>;
  getCompanyDetails(companyId: string, jurisdiction: string): Promise<RawCompanyDetails | null>;
  getSanctions(companyName: string, jurisdiction: string): Promise<RawSanctionsResult>;
  getWebSearch(companyName: string, jurisdiction: string): Promise<RawWebSearchResult[]>;
}
