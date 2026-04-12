import { useState, useRef } from 'react'
import './App.css'
import type { CompanySearchItem, CompanyRiskProfile, SSEEvent } from './types'

const JURISDICTIONS = [
  { code: 'AF', label: 'Afghanistan' },
  { code: 'AL', label: 'Albania' },
  { code: 'DZ', label: 'Algeria' },
  { code: 'AD', label: 'Andorra' },
  { code: 'AO', label: 'Angola' },
  { code: 'AG', label: 'Antigua and Barbuda' },
  { code: 'AR', label: 'Argentina' },
  { code: 'AM', label: 'Armenia' },
  { code: 'AU', label: 'Australia' },
  { code: 'AT', label: 'Austria' },
  { code: 'AZ', label: 'Azerbaijan' },
  { code: 'BS', label: 'Bahamas' },
  { code: 'BH', label: 'Bahrain' },
  { code: 'BD', label: 'Bangladesh' },
  { code: 'BB', label: 'Barbados' },
  { code: 'BY', label: 'Belarus' },
  { code: 'BE', label: 'Belgium' },
  { code: 'BZ', label: 'Belize' },
  { code: 'BJ', label: 'Benin' },
  { code: 'BT', label: 'Bhutan' },
  { code: 'BO', label: 'Bolivia' },
  { code: 'BA', label: 'Bosnia and Herzegovina' },
  { code: 'BW', label: 'Botswana' },
  { code: 'BR', label: 'Brazil' },
  { code: 'BN', label: 'Brunei' },
  { code: 'BG', label: 'Bulgaria' },
  { code: 'BF', label: 'Burkina Faso' },
  { code: 'BI', label: 'Burundi' },
  { code: 'CV', label: 'Cabo Verde' },
  { code: 'KH', label: 'Cambodia' },
  { code: 'CM', label: 'Cameroon' },
  { code: 'CA', label: 'Canada' },
  { code: 'CF', label: 'Central African Republic' },
  { code: 'TD', label: 'Chad' },
  { code: 'CL', label: 'Chile' },
  { code: 'CN', label: 'China' },
  { code: 'CO', label: 'Colombia' },
  { code: 'KM', label: 'Comoros' },
  { code: 'CG', label: 'Congo' },
  { code: 'CD', label: 'Congo (DRC)' },
  { code: 'CR', label: 'Costa Rica' },
  { code: 'HR', label: 'Croatia' },
  { code: 'CU', label: 'Cuba' },
  { code: 'CY', label: 'Cyprus' },
  { code: 'CZ', label: 'Czech Republic' },
  { code: 'DK', label: 'Denmark' },
  { code: 'DJ', label: 'Djibouti' },
  { code: 'DM', label: 'Dominica' },
  { code: 'DO', label: 'Dominican Republic' },
  { code: 'EC', label: 'Ecuador' },
  { code: 'EG', label: 'Egypt' },
  { code: 'SV', label: 'El Salvador' },
  { code: 'GQ', label: 'Equatorial Guinea' },
  { code: 'ER', label: 'Eritrea' },
  { code: 'EE', label: 'Estonia' },
  { code: 'SZ', label: 'Eswatini' },
  { code: 'ET', label: 'Ethiopia' },
  { code: 'FJ', label: 'Fiji' },
  { code: 'FI', label: 'Finland' },
  { code: 'FR', label: 'France' },
  { code: 'GA', label: 'Gabon' },
  { code: 'GM', label: 'Gambia' },
  { code: 'GE', label: 'Georgia' },
  { code: 'DE', label: 'Germany' },
  { code: 'GH', label: 'Ghana' },
  { code: 'GR', label: 'Greece' },
  { code: 'GD', label: 'Grenada' },
  { code: 'GT', label: 'Guatemala' },
  { code: 'GN', label: 'Guinea' },
  { code: 'GW', label: 'Guinea-Bissau' },
  { code: 'GY', label: 'Guyana' },
  { code: 'HT', label: 'Haiti' },
  { code: 'HN', label: 'Honduras' },
  { code: 'HU', label: 'Hungary' },
  { code: 'IS', label: 'Iceland' },
  { code: 'IN', label: 'India' },
  { code: 'ID', label: 'Indonesia' },
  { code: 'IR', label: 'Iran' },
  { code: 'IQ', label: 'Iraq' },
  { code: 'IE', label: 'Ireland' },
  { code: 'IL', label: 'Israel' },
  { code: 'IT', label: 'Italy' },
  { code: 'JM', label: 'Jamaica' },
  { code: 'JP', label: 'Japan' },
  { code: 'JO', label: 'Jordan' },
  { code: 'KZ', label: 'Kazakhstan' },
  { code: 'KE', label: 'Kenya' },
  { code: 'KI', label: 'Kiribati' },
  { code: 'KW', label: 'Kuwait' },
  { code: 'KG', label: 'Kyrgyzstan' },
  { code: 'LA', label: 'Laos' },
  { code: 'LV', label: 'Latvia' },
  { code: 'LB', label: 'Lebanon' },
  { code: 'LS', label: 'Lesotho' },
  { code: 'LR', label: 'Liberia' },
  { code: 'LY', label: 'Libya' },
  { code: 'LI', label: 'Liechtenstein' },
  { code: 'LT', label: 'Lithuania' },
  { code: 'LU', label: 'Luxembourg' },
  { code: 'MG', label: 'Madagascar' },
  { code: 'MW', label: 'Malawi' },
  { code: 'MY', label: 'Malaysia' },
  { code: 'MV', label: 'Maldives' },
  { code: 'ML', label: 'Mali' },
  { code: 'MT', label: 'Malta' },
  { code: 'MH', label: 'Marshall Islands' },
  { code: 'MR', label: 'Mauritania' },
  { code: 'MU', label: 'Mauritius' },
  { code: 'MX', label: 'Mexico' },
  { code: 'FM', label: 'Micronesia' },
  { code: 'MD', label: 'Moldova' },
  { code: 'MC', label: 'Monaco' },
  { code: 'MN', label: 'Mongolia' },
  { code: 'ME', label: 'Montenegro' },
  { code: 'MA', label: 'Morocco' },
  { code: 'MZ', label: 'Mozambique' },
  { code: 'MM', label: 'Myanmar' },
  { code: 'NA', label: 'Namibia' },
  { code: 'NR', label: 'Nauru' },
  { code: 'NP', label: 'Nepal' },
  { code: 'NL', label: 'Netherlands' },
  { code: 'NZ', label: 'New Zealand' },
  { code: 'NI', label: 'Nicaragua' },
  { code: 'NE', label: 'Niger' },
  { code: 'NG', label: 'Nigeria' },
  { code: 'KP', label: 'North Korea' },
  { code: 'MK', label: 'North Macedonia' },
  { code: 'NO', label: 'Norway' },
  { code: 'OM', label: 'Oman' },
  { code: 'PK', label: 'Pakistan' },
  { code: 'PW', label: 'Palau' },
  { code: 'PA', label: 'Panama' },
  { code: 'PG', label: 'Papua New Guinea' },
  { code: 'PY', label: 'Paraguay' },
  { code: 'PE', label: 'Peru' },
  { code: 'PH', label: 'Philippines' },
  { code: 'PL', label: 'Poland' },
  { code: 'PT', label: 'Portugal' },
  { code: 'QA', label: 'Qatar' },
  { code: 'RO', label: 'Romania' },
  { code: 'RU', label: 'Russia' },
  { code: 'RW', label: 'Rwanda' },
  { code: 'KN', label: 'Saint Kitts and Nevis' },
  { code: 'LC', label: 'Saint Lucia' },
  { code: 'VC', label: 'Saint Vincent and the Grenadines' },
  { code: 'WS', label: 'Samoa' },
  { code: 'SM', label: 'San Marino' },
  { code: 'ST', label: 'São Tomé and Príncipe' },
  { code: 'SA', label: 'Saudi Arabia' },
  { code: 'SN', label: 'Senegal' },
  { code: 'RS', label: 'Serbia' },
  { code: 'SC', label: 'Seychelles' },
  { code: 'SL', label: 'Sierra Leone' },
  { code: 'SG', label: 'Singapore' },
  { code: 'SK', label: 'Slovakia' },
  { code: 'SI', label: 'Slovenia' },
  { code: 'SB', label: 'Solomon Islands' },
  { code: 'SO', label: 'Somalia' },
  { code: 'ZA', label: 'South Africa' },
  { code: 'SS', label: 'South Sudan' },
  { code: 'ES', label: 'Spain' },
  { code: 'LK', label: 'Sri Lanka' },
  { code: 'SD', label: 'Sudan' },
  { code: 'SR', label: 'Suriname' },
  { code: 'SE', label: 'Sweden' },
  { code: 'CH', label: 'Switzerland' },
  { code: 'SY', label: 'Syria' },
  { code: 'TW', label: 'Taiwan' },
  { code: 'TJ', label: 'Tajikistan' },
  { code: 'TZ', label: 'Tanzania' },
  { code: 'TH', label: 'Thailand' },
  { code: 'TL', label: 'Timor-Leste' },
  { code: 'TG', label: 'Togo' },
  { code: 'TO', label: 'Tonga' },
  { code: 'TT', label: 'Trinidad and Tobago' },
  { code: 'TN', label: 'Tunisia' },
  { code: 'TR', label: 'Turkey' },
  { code: 'TM', label: 'Turkmenistan' },
  { code: 'TV', label: 'Tuvalu' },
  { code: 'UG', label: 'Uganda' },
  { code: 'UA', label: 'Ukraine' },
  { code: 'AE', label: 'United Arab Emirates' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'US', label: 'United States' },
  { code: 'UY', label: 'Uruguay' },
  { code: 'UZ', label: 'Uzbekistan' },
  { code: 'VU', label: 'Vanuatu' },
  { code: 'VE', label: 'Venezuela' },
  { code: 'VN', label: 'Vietnam' },
  { code: 'YE', label: 'Yemen' },
  { code: 'ZM', label: 'Zambia' },
  { code: 'ZW', label: 'Zimbabwe' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(val: string | null | undefined): string {
  return val ?? '—'
}

function fmtDate(val: string | null | undefined): string {
  if (!val) return '—'
  try {
    return new Date(val).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return val
  }
}

function statusColor(status: CompanySearchItem['status']): string {
  return { active: 'badge-green', dissolved: 'badge-red', dormant: 'badge-yellow', liquidation: 'badge-orange', unknown: 'badge-gray' }[status] ?? 'badge-gray'
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Sev({ level }: { level: string }) {
  return <span className={`sev sev-${level}`}>{level}</span>
}

function Section({ title, aside, children }: { title: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="section">
      <div className="section-title">
        {title}
        {aside && <span className="section-title-badge">{aside}</span>}
      </div>
      {children}
    </div>
  )
}

function InfoField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="info-field-label">{label}</div>
      <div className="info-field-value">{value}</div>
    </div>
  )
}

function ProfileView({ profile }: { profile: CompanyRiskProfile }) {
  return (
    <div>
      {/* Header */}
      <div className="profile-header">
        <div>
          <div className="profile-company-name">{fmt(profile.companyName)}</div>
          <div className="profile-meta">
            <span>{fmt(profile.registrationNumber)}</span>
            <span className="profile-meta-dot">·</span>
            <span>{profile.jurisdiction}</span>
            {profile.companyStatus && (
              <>
                <span className="profile-meta-dot">·</span>
                <span className={`badge ${statusColor(profile.companyStatus as CompanySearchItem['status'])}`}>
                  {profile.companyStatus}
                </span>
              </>
            )}
            <span className="profile-meta-dot">·</span>
            <span>incorporated {fmtDate(profile.incorporationDate)}</span>
          </div>
        </div>
        <span className={`risk-badge risk-${profile.riskLevel}`}>{profile.riskLevel} risk</span>
      </div>

      {/* Narrative */}
      {profile.riskNarrative && (
        <Section title="Summary">
          <p className="narrative">{profile.riskNarrative}</p>
        </Section>
      )}

      {/* Risk Indicators */}
      <Section title="Risk Indicators" aside={`${profile.riskIndicators.length} flag${profile.riskIndicators.length !== 1 ? 's' : ''}`}>
        {profile.riskIndicators.length === 0 ? (
          <p className="empty">No risk flags identified.</p>
        ) : (
          <div className="indicator-list">
            {profile.riskIndicators.map((ind, i) => (
              <div key={i} className="indicator">
                <Sev level={ind.severity} />
                <div className="indicator-text">
                  <span className="indicator-code">{ind.code}</span>
                  <span className="indicator-desc">{ind.description}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Sanctions */}
      <Section title="Sanctions">
        {profile.sanctions.isOnSanctionsList ? (
          <div>
            <div className="sanctions-hit-label">
              <Sev level="critical" />
              Company appears on sanctions list(s)
            </div>
            <div className="sanctions-lists">
              {profile.sanctions.lists.map((l, i) => <span key={i} className="list-tag">{l}</span>)}
            </div>
          </div>
        ) : (
          <div className="sanctions-clear">✓ No sanctions matches found</div>
        )}
      </Section>

      {/* Company Info */}
      <Section title="Company Information">
        <div className="info-grid">
          <InfoField label="Registered address" value={fmt(profile.registeredAddress)} />
          <InfoField label="Last accounts" value={fmtDate(profile.lastAccountsDate)} />
          {profile.sicCode && <InfoField label="SIC code" value={profile.sicCode} />}
          {profile.sicDescription && <InfoField label="Industry" value={profile.sicDescription} />}
        </div>
      </Section>

      {/* Confidence */}
      <Section title="Data Confidence">
        <div className="conf-row">
          <span className="conf-row-label">Overall confidence</span>
          <div className="conf-track"><div className="conf-fill" style={{ width: `${profile.confidence.overall}%` }} /></div>
          <span className="conf-pct">{profile.confidence.overall}%</span>
        </div>
        <div className="conf-row">
          <span className="conf-row-label">Data completeness</span>
          <div className="conf-track"><div className="conf-fill" style={{ width: `${profile.confidence.completenessPercent}%` }} /></div>
          <span className="conf-pct">{profile.confidence.completenessPercent}%</span>
        </div>
      </Section>

      {/* Directors */}
      <Section title="Directors & Officers" aside={`${profile.directors.length} record${profile.directors.length !== 1 ? 's' : ''}`}>
        {profile.directors.length === 0 ? (
          <p className="empty">No director records available.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th><th>Role</th><th>Appointed</th><th>Resigned</th><th>Nationality</th><th>Other cos</th>
              </tr>
            </thead>
            <tbody>
              {profile.directors.map((d, i) => (
                <tr key={i}>
                  <td>{d.name}{d.isSanctioned && <Sev level="critical" />}</td>
                  <td>{fmt(d.role)}</td>
                  <td>{fmtDate(d.appointedOn)}</td>
                  <td>{d.resignedOn ? fmtDate(d.resignedOn) : '—'}</td>
                  <td>{fmt(d.nationality)}</td>
                  <td>{d.otherCompanyCount ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>

      {/* Filings */}
      <Section title="Filing History" aside={profile.hasOverdueFilings ? <Sev level="medium" /> : 'Up to date'}>
        {profile.filings.length === 0 ? (
          <p className="empty">No filing records available.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Type</th><th>Date</th><th>Description</th><th>Status</th></tr>
            </thead>
            <tbody>
              {profile.filings.map((f, i) => (
                <tr key={i}>
                  <td><code>{f.type}</code></td>
                  <td>{fmtDate(f.date)}</td>
                  <td>{fmt(f.description)}</td>
                  <td>{f.isOverdue ? <Sev level="medium" /> : <span style={{ color: 'var(--green-text)' }}>✓</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>

      {/* Adverse Media */}
      <Section title="Adverse Media" aside={`${profile.adverseMedia.length} item${profile.adverseMedia.length !== 1 ? 's' : ''}`}>
        {profile.adverseMedia.length === 0 ? (
          <p className="empty">No adverse media found.</p>
        ) : (
          profile.adverseMedia.map((m, i) => (
            <div key={i} className="media-item">
              <a href={m.url} target="_blank" rel="noopener noreferrer" className="media-headline">{m.headline}</a>
              <div className="media-meta">
                {m.publishedAt && <><span>{fmtDate(m.publishedAt)}</span><span className="media-sep">·</span></>}
                <span className={`sentiment-${m.sentiment}`}>{m.sentiment}</span>
                <span className="media-sep">·</span>
                <span>{m.category}</span>
              </div>
            </div>
          ))
        )}
      </Section>

      <p className="assessed-at">Assessed {fmtDate(profile.assessedAt)}</p>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [companyName, setCompanyName] = useState('')
  const [regNumber, setRegNumber] = useState('')
  const [jurisdiction, setJurisdiction] = useState('GB')
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [results, setResults] = useState<CompanySearchItem[] | null>(null)
  const [resultsMessage, setResultsMessage] = useState<string | null>(null)

  const [assessing, setAssessing] = useState(false)
  const [statusMsg, setStatusMsg] = useState<string | null>(null)
  const [assessError, setAssessError] = useState<string | null>(null)
  const [profile, setProfile] = useState<CompanyRiskProfile | null>(null)

  const abortRef = useRef<AbortController | null>(null)

  async function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const name = companyName.trim()
    const number = regNumber.trim()
    if (!name && !number) return

    setSearching(true)
    setSearchError(null)
    setResults(null)
    setResultsMessage(null)
    setProfile(null)
    setAssessError(null)
    setStatusMsg(null)

    try {
      const params = new URLSearchParams({ jurisdiction })
      if (name) params.set('name', name)
      if (number) params.set('number', number)
      const res = await fetch(`/companies/search?${params}`)
      const json = await res.json()

      if (!res.ok) {
        setSearchError(json.error ?? 'Search failed')
        return
      }

      setResults(json.data ?? [])
      if (json.message) setResultsMessage(json.message)
    } catch (err) {
      setSearchError('Network error — is the server running?')
    } finally {
      setSearching(false)
    }
  }

  async function handleSelectCompany(company: CompanySearchItem) {
    // Cancel any in-flight assessment
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setAssessing(true)
    setAssessError(null)
    setProfile(null)
    setStatusMsg('Starting assessment...')

    try {
      const res = await fetch('/risk-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: company.companyId, jurisdiction: company.jurisdiction }),
        signal: controller.signal,
      })

      if (!res.ok || !res.body) {
        const json = await res.json().catch(() => ({}))
        setAssessError(json.error ?? `Server error ${res.status}`)
        setAssessing(false)
        setStatusMsg(null)
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (!raw) continue

          let evt: SSEEvent
          try { evt = JSON.parse(raw) } catch { continue }

          if (evt.type === 'status') {
            setStatusMsg(evt.message)
          } else if (evt.type === 'result') {
            setProfile(evt.data)
            setAssessing(false)
            setStatusMsg(null)
          } else if (evt.type === 'error') {
            setAssessError(evt.message)
            setAssessing(false)
            setStatusMsg(null)
          } else if (evt.type === 'done') {
            setAssessing(false)
            setStatusMsg(null)
          }
        }
      }
    } catch (err: unknown) {
      if ((err as Error)?.name !== 'AbortError') {
        setAssessError('Connection lost during assessment')
      }
      setAssessing(false)
      setStatusMsg(null)
    }
  }

  function clearSearch() {
    setCompanyName(''); setRegNumber(''); setResults(null);
    setProfile(null); setSearchError(null); setAssessError(null); setStatusMsg(null);
  }

  return (
    <div className="app">
      {/* Top nav */}
      <nav className="topnav">
        <div className="topnav-logo">
          <svg viewBox="0 0 16 16"><path d="M3 2h10a1 1 0 0 1 1 1v2H2V3a1 1 0 0 1 1-1zm-1 5h12v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7zm3 2v1h6V9H5z" /></svg>
        </div>
        <span className="topnav-title">KYB Risk Assessment</span>
        <span className="topnav-badge">Demo</span>
      </nav>

      <main className="main">
        {/* Search panel */}
        <div className="search-panel">
          <p className="search-panel-hint">
            Enter a company name, registration number, or both
            <span className="hint-dot" />
            Select the country of registration
          </p>
          <form onSubmit={handleSearch}>
            <div className="search-row">
              <div className="field">
                <label htmlFor="field-name">Company name</label>
                <input
                  id="field-name"
                  type="text"
                  placeholder="e.g. Marks and Spencer"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  disabled={searching || assessing}
                />
              </div>
              <div className="search-or">or</div>
              <div className="field">
                <label htmlFor="field-number">Registration number</label>
                <input
                  id="field-number"
                  type="text"
                  placeholder="e.g. 00445790"
                  value={regNumber}
                  onChange={e => setRegNumber(e.target.value)}
                  disabled={searching || assessing}
                />
              </div>
              <div className="field">
                <label htmlFor="field-country">Country</label>
                <select
                  id="field-country"
                  value={jurisdiction}
                  onChange={e => setJurisdiction(e.target.value)}
                  disabled={searching || assessing}
                >
                  {JURISDICTIONS.map(j => (
                    <option key={j.code} value={j.code}>{j.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="search-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={searching || assessing || (!companyName.trim() && !regNumber.trim())}
              >
                {searching && <span className="spinner" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} />}
                {searching ? 'Searching…' : 'Search'}
              </button>
              {(companyName || regNumber) && !searching && (
                <button type="button" className="btn btn-ghost" onClick={clearSearch}>
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Search error */}
        {searchError && (
          <div className="alert alert-error">
            <span className="alert-icon">&#9888;</span>
            {searchError}
          </div>
        )}

        {/* Results */}
        {results !== null && !assessing && !profile && (
          results.length === 0 ? (
            <div className="no-results">
              <div className="no-results-title">No companies found</div>
              <div className="no-results-sub">Try a different name, registration number, or country.</div>
            </div>
          ) : (
            <>
              <p className="results-meta">
                {results.length} result{results.length !== 1 ? 's' : ''}
                {resultsMessage ? ` · ${resultsMessage}` : ' · Please select a company to assess its risk profile.'}
              </p>
              <div className="results-table">
                <div className="results-table-head">
                  <span>Company name</span>
                  <span>Reg. number</span>
                  <span>Incorporated</span>
                  <span>Status</span>
                </div>
                {results.map(r => (
                  <div key={r.companyId} className="results-table-row" onClick={() => handleSelectCompany(r)}>
                    <div>
                      <div className="result-name">{r.name}</div>
                      {r.address && <div className="result-addr">{r.address}</div>}
                    </div>
                    <span className="result-number">{r.number}</span>
                    <span className="result-date">{fmtDate(r.incorporationDate)}</span>
                    <span className={`badge ${statusColor(r.status)}`}>{r.status}</span>
                  </div>
                ))}
              </div>
            </>
          )
        )}

        {/* Assessment status */}
        {assessing && statusMsg && (
          <div className="status-bar">
            <div className="spinner" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Assessment error */}
        {assessError && (
          <div className="alert alert-error">
            <span className="alert-icon">&#9888;</span>
            {assessError}
          </div>
        )}

        {/* Risk profile */}
        {profile && <ProfileView profile={profile} />}
      </main>
    </div>
  )
}
