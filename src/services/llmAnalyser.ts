import OpenAI from 'openai';
import { config } from '../config';
import {
  RawCompanyDetails,
  RawSanctionsResult,
  RawWebSearchResult,
  CompanyRiskProfile,
  RiskIndicator,
} from '../types';

const client = new OpenAI({
  baseURL: config.llm.baseURL,
  apiKey: config.openRouterApiKey,
});

export interface LLMAnalysis {
  companyName: string | null;
  registrationNumber: string | null;
  registeredAddress: string | null;
  incorporationDate: string | null;
  companyStatus: 'active' | 'dissolved' | 'dormant' | 'liquidation' | 'unknown' | null;
  sicCode: string | null;
  sicDescription: string | null;
  directors: CompanyRiskProfile['directors'];
  filings: CompanyRiskProfile['filings'];
  hasOverdueFilings: boolean;
  lastAccountsDate: string | null;
  adverseMedia: CompanyRiskProfile['adverseMedia'];
  sanctions: CompanyRiskProfile['sanctions'];
  riskIndicators: RiskIndicator[];
  riskNarrative: string;
  confidence: { overall: number };
}

function buildPrompt(
  _companyId: string,
  _jurisdiction: string,
  ch: RawCompanyDetails,
  sanctions: RawSanctionsResult,
  webResults: RawWebSearchResult[]
): string {
  return `You are a KYB (Know Your Business) risk analyst. You have gathered raw data from multiple sources about a company. Your job is to:
1. Structure all the raw data into a consistent JSON schema
2. Identify risk flags based on the data
3. Write a plain-English risk narrative

---
SOURCE 1: Companies House API (UK company registry)
${JSON.stringify(ch, null, 2)}

---
SOURCE 2: ComplyAdvantage Sanctions Screening
${JSON.stringify(sanctions, null, 2)}

---
SOURCE 3: Web Search Results
${JSON.stringify(webResults, null, 2)}

---
RISK FLAGS TO ASSESS (include only those that apply):
- SANCTIONS_HIT: company appears in sanctions screening (critical)
- DIRECTOR_SANCTIONED: a director is personally sanctioned (critical)
- HIGH_RISK_JURISDICTION: jurisdiction is a high-risk or sanctioned territory (high)
- COMPANY_INACTIVE: company status is dissolved or in liquidation (high)
- ADVERSE_MEDIA: negative news coverage found — fraud, regulatory, or reputational (medium–high)
- OVERDUE_FILINGS: company has overdue annual accounts or confirmation statements (medium)
- NO_PERSONNEL: no directors or officers identified (medium)
- COMPANY_AGE: incorporated less than 12 months ago (medium)
- HIGH_DIRECTOR_OVERLAP: a director holds more than 4 concurrent directorships (medium)
- NAME_SIC_MISMATCH: company name does not match its stated industry/SIC code (medium)

Return ONLY valid JSON — no markdown, no explanation — in exactly this structure:
{
  "companyName": string | null,
  "registrationNumber": string | null,
  "registeredAddress": string | null,
  "incorporationDate": "YYYY-MM-DD" | null,
  "companyStatus": "active" | "dissolved" | "dormant" | "liquidation" | "unknown" | null,
  "sicCode": string | null,
  "sicDescription": string | null,
  "directors": [
    {
      "name": string,
      "role": string,
      "appointedOn": string | null,
      "resignedOn": string | null,
      "nationality": string | null,
      "otherCompanyCount": number | null,
      "isSanctioned": boolean
    }
  ],
  "filings": [
    {
      "type": string,
      "date": string,
      "description": string | null,
      "isOverdue": boolean
    }
  ],
  "hasOverdueFilings": boolean,
  "lastAccountsDate": string | null,
  "adverseMedia": [
    {
      "headline": string,
      "url": string,
      "publishedAt": string | null,
      "sentiment": "negative" | "neutral" | "positive",
      "category": "fraud" | "litigation" | "regulatory" | "insolvency" | "reputational" | "other"
    }
  ],
  "sanctions": {
    "isOnSanctionsList": boolean,
    "lists": string[]
  },
  "riskIndicators": [
    {
      "code": string,
      "severity": "low" | "medium" | "high" | "critical",
      "description": string
    }
  ],
  "riskNarrative": string,
  "confidence": {
    "overall": number
  }
}`;
}

export async function analyseWithLLM(
  companyId: string,
  jurisdiction: string,
  ch: RawCompanyDetails,
  sanctions: RawSanctionsResult,
  webResults: RawWebSearchResult[]
): Promise<LLMAnalysis> {
  const response = await client.chat.completions.create({
    model: config.llm.model,
    temperature: config.llm.temperature,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'user',
        content: buildPrompt(companyId, jurisdiction, ch, sanctions, webResults),
      },
    ],
  });

  const content = response.choices[0]?.message?.content ?? '{}';

  try {
    return JSON.parse(content) as LLMAnalysis;
  } catch {
    return {
      companyName: ch.company_name,
      registrationNumber: ch.company_number,
      registeredAddress: null,
      incorporationDate: null,
      companyStatus: null,
      sicCode: null,
      sicDescription: null,
      directors: [],
      filings: [],
      hasOverdueFilings: false,
      lastAccountsDate: null,
      adverseMedia: [],
      sanctions: { isOnSanctionsList: false, lists: [] },
      riskIndicators: [],
      riskNarrative: 'Risk analysis could not be completed due to a parsing error.',
      confidence: { overall: 0 },
    };
  }
}
