# Company Risk Assessment

A system that gathers and structures information about companies to risk-assess them as payment beneficiaries.

---

## Getting Started

### Prerequisites

- Node.js 18+
- An OpenRouter API key (for LLM analysis)

### Setup

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
AUTH_SECRET=your_shared_secret_here
VITE_AUTH_SECRET=your_shared_secret_here
PORT=3000
```

3. Start the server:

```bash
npm run dev:server
```

4. In a separate terminal, start the client:

```bash
npm run dev:client
```

The client runs on `http://localhost:5173` and proxies API requests to the server on port `3000`.

---

## Architecture

### Overview

```
Client (React + Vite)
  └── Search Panel
        ├── GET /companies/search        → Search results
        └── GET /risk-assessment (SSE)   → Progressive risk profile

Server (Express + TypeScript)
  ├── /companies/search
  │     └── CompanySearch service → Mock provider
  └── /risk-assessment (SSE)
        ├── CompanyDetailsAssessor  → Mock Companies House
        ├── SanctionsAssessor       → Mock ComplyAdvantage
        ├── WebSearchAssessor       → Mock web search
        └── LLM Analyser

Tests (Vitest — server only)
  ├── assessors/
  │     ├── companyDetails.test.ts  → fetch/map logic, field normalisation
  │     ├── sanctions.test.ts       → sanctions hit detection, list mapping
  │     └── webSearch.test.ts       → search result parsing
  ├── controllers/
  │     ├── companySearch.controller.test.ts  → search endpoint behaviour
  │     ├── validateRiskInput.test.ts         → risk input validation rules
  │     └── validateSearchInput.test.ts       → search input validation rules
  └── services/
        ├── companySearch.service.test.ts  → search service logic
        └── profileBuilder.test.ts         → profile assembly from source results
```

### Two-step flow

The UI is intentionally split into two steps:

1. **Search** — the user searches by name, registration number, or both. Results are deduplicated and paginated.
2. **Assess** — the user selects a company from the results. The assessment starts immediately, with results streamed progressively via SSE.

The selection step is deliberate: company names are not unique, and a search for "Acme Ltd" may return several legally distinct entities. Requiring the user to pick the correct company before assessment starts eliminates ambiguity and ensures all identifiers (`companyId`, `companyName`, `registrationNumber`, `jurisdiction`) are confirmed before any data is fetched.

### Provider layer

Each assessor delegates its network call to a provider module (`providers/mock.ts`). The provider simulates a third-party API — Companies House, ComplyAdvantage, Brave Search — and returns realistic data covering the key risk scenarios. In production, each provider would be its own client module with the same interface, and the assessor would swap implementations based on environment. The assessor layer itself would not change.

### Progressive delivery via SSE

The risk assessment endpoint uses Server-Sent Events to stream results as each data source completes. The three data sources run in parallel. Each source reports its own success or failure independently — one source failing does not block the others. The LLM analysis runs after all sources complete, using their combined output as context.

If the LLM analysis fails or times out, the profile is still returned with the raw source data (company details, sanctions) so the user always gets something useful.

### Assessor pattern

All data sources implement the `DataSource` abstract base class:

```
DataSource
  ├── fetch()   — network/provider call, returns raw data
  ├── map()     — normalises raw data into a consistent shape
  └── collect() — orchestrates fetch → map, wraps result in SourceResult
```

### LLM integration

Raw data from all sources is passed to the LLM in a single prompt. The LLM is responsible for:

- Identifying risk indicators from the combined evidence
- Classifying adverse media by sentiment and category
- Writing a plain-English risk narrative
- Assigning a confidence score based on evidence quality

The prompt provides the model with:
- A defined KYB analyst role
- The raw source data from each assessor
- An enumerated list of risk flags with severity guidance
- A confidence scoring scale with clear thresholds
- A strict JSON schema the response must conform to

The output is validated against a Zod schema. If validation fails, the error details are logged.

---

## Design Decisions & Trade-offs

### Mock providers instead of real APIs

All data sources use mock providers with realistic data covering the key risk scenarios. This keeps the focus on data processing and LLM integration rather than API integration work.

In production, each mock provider would be replaced with a real integration — Companies House API, ComplyAdvantage, Brave Search ext — without changing any other code.

### SSE over WebSockets

SSE is simpler to implement and sufficient for unidirectional server-to-client streaming. The assessment flow is inherently one-way — the server pushes updates as sources complete. WebSockets would add bidirectional complexity with no benefit here.

### Single LLM call with all sources

Rather than calling the LLM once per source, all data is passed in a single prompt. This reduces latency and allows the model to reason across sources — for example, correlating adverse media with sanctions hits or overdue filings with director overlap.

### Auth via shared secret

A shared secret in the `x-auth-secret` header protects the search endpoint. The risk assessment endpoint uses SSE, and browsers cannot set custom headers on `EventSource` connections.

**Known limitation:** the SSE endpoint currently has no authentication. The production fix would be a short-lived signed cookie set during the search request and validated on the SSE connection.

---

## Assumptions

### Handling ambiguity — multiple matches

*Decision:* Always show a list of matching companies and require the user to select one before assessment starts.

*Reason:* Company names are not unique and users may not know the legal registered name. Auto-selecting the closest match risks assessing the wrong legal entity — for a payment risk tool that could have compliance consequences. Making the selection explicit keeps the reviewer accountable for which entity they assessed.

### No results found

*Decision:* Show a clear empty state with guidance to adjust the name, registration number, or jurisdiction.

*Reason:* Returning nothing silently would leave the user unsure whether the company doesn't exist or the search terms were wrong. A specific message reduces friction and helps the user self-correct.

### When results are final

*Decision:* The full risk profile only appears once all data sources and the LLM have completed. Until then, a per-source progress tracker shows what is in flight.

*Reason:* Showing a partial profile risks a reviewer acting on incomplete information — for example, seeing clean company details before the sanctions result has arrived. The progress tracker provides real-time feedback that work is ongoing without exposing an incomplete picture.

### Not retaining assessment data

*Decision:* Assessment results are session-only. Nothing is persisted to a database.

*Reason:* Persistence is out of scope for a prototype — it would require a user model, a database, and a data retention and deletion policy (particularly given GDPR implications of storing third-party company data). The immediate value of the tool is the real-time risk signal.

### Scope

- Mock data covers GB companies only. The jurisdiction selector supports all countries, but only GB searches will return meaningful results from the mock provider.
- The UI is read-only. There is no ability to override, annotate, or accept/reject a risk result.
- The intended user is a compliance or payments reviewer making a pre-payment beneficiary check. They need a fast risk signal, not a deep investigative tool.

---

## Known Limitations & What I'd Improve With More Time

### Latency target — results within 10 seconds
In production, the main latency risk would be slow external API responses. Per-source timeouts would cap the worst case and allow the LLM to proceed with whatever data arrived in time.

### User authentication
The current implementation uses a shared `x-auth-secret` header — sufficient for a take-home scope but not for production. With more time, the better approach is JWT-based user authentication: each user gets a signed token on login, the token is verified on every request, and no shared secret is needed.

### Authentication on SSE endpoint
`EventSource` cannot send custom headers, so the `x-auth-secret` approach used on the search endpoint is not available here. One workaround is passing the token as a query parameter, but this exposes credentials in server logs, browser history, and referrer headers — not acceptable for a production system. The correct fix is a short-lived signed cookie set on the search response and validated on the SSE request, which keeps the credential out of the URL entirely.

### AI-assisted search for no-results cases
When a search returns no results, the user currently sees an empty state. A better experience would pass the user's query to the LLM and return a list of suggested company names — "Did you mean…?" — that the user can click to retry the search. This is especially useful for misspellings, trading names, or informal names that don't match the registered name exactly.

### International company support
The current mock data only covers UK companies. For genuine international coverage, integrating a provider with a broader dataset — such as Dun & Bradstreet, which covers 500M+ companies across 200+ countries — would allow the same assessor pipeline to work globally without jurisdiction-specific logic.

### LLM retry with corrective prompting
If the LLM response fails schema validation, the system currently logs the error and returns a partial profile. A better approach is to send the failed response back to the model with the specific validation errors and ask it to correct them. This significantly improves reliability with less capable models.

### Prompt injection filtering
Web search results are injected into the LLM prompt verbatim. A malicious company description could attempt to override the prompt instructions. In production, source content should be sanitised or wrapped in a way that separates it clearly from instructions.

### Prompt versioning
There is currently no versioning or tracking of prompt changes. I don’t have hands-on experience in this area yet, so I would need some time to research and apply best practices. At a minimum, a production system should version prompts and evaluate outputs before deployment.

### Risk level explainer
The risk badge shows `low / medium / high / critical / unknown` with no explanation of what each level means. A `ⓘ` icon beside the badge that triggers a tooltip or popover listing all levels with a one-line description each would give users — especially non-technical compliance reviewers — immediate context without cluttering the UI for users already familiar with the scale.

### Scaling
For 1,000 queries/minute:
- Move LLM calls to a queue (e.g. BullMQ) to avoid overwhelming the API rate limits
- Cache company detail lookups by `companyId` with a short TTL (company data changes infrequently)

### Other production considerations
- **Rate limiting** — no rate limiting exists on either endpoint. In production, limits per user/IP would prevent abuse and protect LLM API costs.
- **Audit logging** — for a compliance tool, there should be a record of who assessed which company and when. Currently nothing is logged or stored beyond the session.
- **Observability** — no structured logging, metrics, or error tracking (e.g. Sentry). In production, LLM failures, source timeouts, and validation errors should be surfaced to an alerting system.
- **GDPR / data handling** — since company data is fetched from external sources and rendered client-side only, there is no personal data stored. A production system would need a clear data retention and deletion policy, especially if assessment results are ever persisted.

---

## Example Inputs & Outputs

### Step 1 — Search endpoint

Search by company name, registration number, or both. Results are paginated.

**Query parameters:**
| Parameter | Required | Description |
|---|---|---|
| `jurisdiction` | Yes | Country code (e.g. `GB`) |
| `name` | One of name / number | Company name (partial match supported) |
| `number` | One of name / number | Registration number (exact match) |
| `page` | No | Page number, defaults to `1` |
| `limit` | No | Results per page, defaults to `10` |

`GET /companies/search?jurisdiction=GB&name=Marks+and+Spencer&page=1&limit=10`

**Response:**
```json
{
  "data": [
    {
      "companyId": "GB:00445790",
      "name": "MARKS AND SPENCER PLC",
      "number": "00445790",
      "jurisdiction": "GB",
      "status": "active",
      "incorporationDate": "1926-09-26"
    }
  ]
}
```

### Step 2 — Risk assessment endpoint

`GET /risk-assessment?companyId=GB:00445790&registrationNumber=00445790&companyName=MARKS+AND+SPENCER+PLC&jurisdiction=GB`

The endpoint streams SSE events as each source completes, then delivers the final profile:

**Final profile payload:**
```json
{
  "riskLevel": "low",
  "jurisdiction": "GB",
  "assessedAt": "2024-01-15T10:30:00Z",
  "companyDetails": {
    "companyName": "MARKS AND SPENCER PLC",
    "registrationNumber": "00445790",
    "companyStatus": "active",
    "incorporationDate": "1926-09-26"
  },
  "sanctions": { "isOnSanctionsList": false, "lists": [] },
  "aiAnalysis": {
    "riskIndicators": [],
    "riskNarrative": "Marks and Spencer PLC is a long-established, active UK retailer with no adverse findings.",
    "adverseMedia": [],
    "confidence": { "overall": 95, "completenessPercent": 100 }
  }
}
```
