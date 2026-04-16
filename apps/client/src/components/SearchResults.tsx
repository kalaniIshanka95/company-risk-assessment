import type { CompanySearchItem, CompanyRiskProfile } from '../types'
import { fmtDate, statusColor } from '../utils/formatters'

type Props = {
  results: CompanySearchItem[] | null
  assessing: boolean
  profile: CompanyRiskProfile | null
  onSelectCompany: (company: CompanySearchItem) => void
}

export default function SearchResults({ results, assessing, profile, onSelectCompany }: Props) {
  if (results === null || assessing || profile) return null

  if (results.length === 0) {
    return (
      <div className="no-results">
        <div className="no-results-title">No companies found</div>
        <div className="no-results-sub">We couldn't find any matching companies. Try adjusting the name, registration number, or country and search again.</div>
      </div>
    )
  }

  return (
    <>
      <p className="results-meta">
        {results.length} result{results.length !== 1 ? 's' : ''}
        {' · Please select a company to assess its risk profile.'}
      </p>
      <div className="results-table">
        <div className="results-table-head">
          <span>Company name</span>
          <span>Reg. number</span>
          <span>Incorporated</span>
          <span>Status</span>
        </div>
        {results.map(r => (
          <div key={r.companyId} className="results-table-row" onClick={() => onSelectCompany(r)}>
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
}
