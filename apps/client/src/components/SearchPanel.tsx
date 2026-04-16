import { JURISDICTIONS } from '@/packages/shared/types/jurisdictions'

type Props = {
  companyName: string
  setCompanyName: (v: string) => void
  regNumber: string
  setRegNumber: (v: string) => void
  jurisdiction: string
  setJurisdiction: (v: string) => void
  searching: boolean
  assessing: boolean
  onSearch: (e: React.SyntheticEvent<HTMLFormElement>) => void
  onClear: () => void
}

export default function SearchPanel({
  companyName, setCompanyName,
  regNumber, setRegNumber,
  jurisdiction, setJurisdiction,
  searching, assessing,
  onSearch, onClear,
}: Props) {
  return (
    <div className="search-panel">
      <p className="search-panel-hint">
        Enter a company name, registration number, or both
        <span className="hint-dot" />
        Select the country of registration
      </p>
      <form onSubmit={onSearch}>
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
            <button type="button" className="btn btn-ghost" onClick={onClear}>
              Clear
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
