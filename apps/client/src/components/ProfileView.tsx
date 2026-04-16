import type { CompanyRiskProfile, CompanySearchItem } from '../types'
import { fmt, fmtDate, fmtJurisdiction, statusColor } from '../utils/formatters'
import Sev from './Sev'
import Section from './Section'
import InfoField from './InfoField'
import Loading from './Loading'

export default function ProfileView({ profile, partial = false }: { profile: CompanyRiskProfile; partial?: boolean }) {
  const cd = profile.companyDetails
  const ai = profile.aiAnalysis

  return (
    <div>
      {/* Header */}
      <div className="profile-header">
        <div>
          <div className="profile-company-name">{fmt(cd?.companyName)}</div>
        </div>
        <div className="risk-badge-wrap">
          {partial
            ? <span className="risk-badge risk-unknown">analysing…</span>
            : <span className={`risk-badge risk-${profile.riskLevel}`}>{profile.riskLevel} risk</span>
          }
          {!partial && profile.riskLevel === 'unknown' && (
            <span className="risk-unknown-note">Could not be determined — AI analysis unavailable</span>
          )}
        </div>
      </div>

      {/* Narrative */}
      {partial
        ? <Section title="Summary"><Loading /></Section>
        : ai?.riskNarrative && <Section title="Summary"><p className="narrative">{ai.riskNarrative}</p></Section>
      }

      {/* Risk Indicators — only shown while loading or when AI analysis succeeded */}
      {(partial || ai) && <Section
        title="Risk Indicators"
        aside={partial ? undefined : `${ai?.riskIndicators.length ?? 0} flag${(ai?.riskIndicators.length ?? 0) !== 1 ? 's' : ''}`}
      >
        {partial ? <Loading /> : ai?.riskIndicators.length === 0 ? (
          <p className="empty">No risk flags identified.</p>
        ) : (
          <div className="indicator-list">
            {ai?.riskIndicators.map((ind, i) => (
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
      </Section>}

      {/* Sanctions */}
      {profile.sanctions && (
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
      )}

      {/* Company Info */}
      <Section title="Company Information">
        <div className="info-grid">
          <InfoField label="Registration number" value={fmt(cd?.registrationNumber)} />
          <InfoField label="Country"            value={fmtJurisdiction(profile.jurisdiction)} />
          {cd?.companyStatus && (
            <InfoField
              label="Status"
              value={<span className={`badge ${statusColor(cd.companyStatus as CompanySearchItem['status'])}`}>{cd.companyStatus}</span>}
            />
          )}
          <InfoField label="Incorporated"       value={fmtDate(cd?.incorporationDate)} />
          <InfoField label="Registered address" value={fmt(cd?.registeredAddress)} />
          <InfoField label="Last accounts"      value={fmtDate(cd?.lastAccountsDate)} />
        </div>
      </Section>

      {/* Confidence */}
      {!partial && ai && (
        <Section title="Data Confidence">
          <div className="conf-row">
            <span className="conf-row-label">Overall confidence</span>
            <div className="conf-track"><div className="conf-fill" style={{ width: `${ai.confidence.overall}%` }} /></div>
            <span className="conf-pct">{ai.confidence.overall}%</span>
          </div>
          <div className="conf-row">
            <span className="conf-row-label">Data completeness</span>
            <div className="conf-track"><div className="conf-fill" style={{ width: `${ai.confidence.completenessPercent}%` }} /></div>
            <span className="conf-pct">{ai.confidence.completenessPercent}%</span>
          </div>
        </Section>
      )}

      {/* Directors */}
      {cd?.officers != null && (
        <Section
          title="Directors & Officers"
          aside={`${cd.officers.length} record${cd.officers.length !== 1 ? 's' : ''}`}
        >
          {cd.officers.length === 0 ? (
            <p className="empty">No officer records available.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th><th>Role</th><th>Appointed</th><th>Resigned</th><th>Nationality</th><th>Other directorships</th>
                </tr>
              </thead>
              <tbody>
                {cd.officers.map((d, i) => (
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
      )}

      {/* Filings */}
      {cd?.filings != null && (
        <Section
          title="Filing History"
          aside={!partial ? (cd.hasOverdueFilings ? <Sev level="medium" /> : 'Up to date') : undefined}
        >
          {cd.filings.length === 0 ? (
            <p className="empty">No filing records available.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Type</th><th>Date</th><th>Description</th><th>Status</th></tr>
              </thead>
              <tbody>
                {cd.filings.map((f, i) => (
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
      )}

      {/* Adverse Media */}
      <Section
        title="Adverse Media"
        aside={!partial && ai ? `${ai.adverseMedia.length} item${ai.adverseMedia.length !== 1 ? 's' : ''}` : undefined}
      >
        {partial && !ai ? <Loading /> : !ai || ai.adverseMedia.length === 0 ? (
          <p className="empty">No adverse media found.</p>
        ) : (
          ai.adverseMedia.map((m, i) => (
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

      {!partial && <p className="assessed-at">Assessed {fmtDate(profile.assessedAt)}</p>}
    </div>
  )
}
