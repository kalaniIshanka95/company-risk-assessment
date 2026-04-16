import OpenAI from 'openai';
import { z } from 'zod';
import { config } from '../config';
import { SourceResult } from '../assessors';

const LLMAnalysisSchema = z.object({
  adverseMedia: z.array(z.object({
    headline: z.string(),
    url: z.string(),
    publishedAt: z.string().nullable().optional(),
    sentiment: z.enum(['negative', 'neutral', 'positive']),
    category: z.enum(['fraud', 'litigation', 'regulatory', 'insolvency', 'reputational', 'other']),
  })),
  riskIndicators: z.array(z.object({
    code: z.string(),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    description: z.string(),
  })),
  riskNarrative: z.string(),
  confidence: z.object({
    overall: z.number().min(0).max(100),
  }),
});

export type LLMAnalysis = z.infer<typeof LLMAnalysisSchema>;

const client = new OpenAI({
  baseURL: config.llm.baseURL,
  apiKey: config.openRouterApiKey,
});

const buildPrompt = (assessorResults: SourceResult[]): string => {
  const sources = assessorResults
    .map((r, i) => `SOURCE ${i + 1}: ${r.name}\n${JSON.stringify(r.data, null, 2)}`)
    .join('\n\n---\n\n');

  return `You are a KYB (Know Your Business) risk analyst. You have gathered raw data from multiple sources about a company. Your job is to:
1. Structure all the raw data into a consistent JSON schema
2. Identify risk flags based on the data
3. Write a plain-English risk narrative

---
${sources}

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

For the confidence.overall field, use the following scale:
- 90–100: clear, unambiguous evidence (e.g. confirmed sanctions hit, explicit fraud reporting)
- 70–89: strong signals but some gaps or indirect evidence
- 50–69: mixed signals or limited corroboration across sources
- below 50: insufficient or contradictory evidence to make a reliable judgement

Return ONLY valid JSON — no markdown, no explanation — in exactly this structure:
{
  "adverseMedia": [
    {
      "headline": "string",
      "url": "string",
      "publishedAt": "string | null",
      "sentiment": "negative | neutral | positive",
      "category": "fraud | litigation | regulatory | insolvency | reputational | other"
    }
  ],
  "riskIndicators": [
    {
      "code": "string",
      "severity": "low | medium | high | critical",
      "description": "string"
    }
  ],
  "riskNarrative": "string",
  "confidence": {
    "overall": 0
  }
}`;
}

export async function analyseWithLLM(assessorResults: SourceResult[]): Promise<LLMAnalysis | null> {
  if (!config.openRouterApiKey) {
    console.warn('OPENROUTER_API_KEY is not set — skipping LLM analysis');
    return null;
  }
  try {
    const response = await client.chat.completions.create({
      model: config.llm.model,
      temperature: config.llm.temperature,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: buildPrompt(assessorResults) }],
    });

    const content = response.choices[0]?.message?.content ?? '{}';
    const parsed = LLMAnalysisSchema.safeParse(JSON.parse(content));
    if (parsed.success) return parsed.data;
    console.error('Error parsing LLM data');
    return null;
  } catch (err) {
    console.error(err);
    return null;
  }
}
