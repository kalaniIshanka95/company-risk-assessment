import { useState, useRef } from 'react'
import './App.css'
import type { CompanySearchItem, CompanyRiskProfile } from './types'
import { type AssessorTrack, INITIAL_TRACKS } from './types/assessment'
import { searchCompanies, startRiskAssessment } from './services/api'
import AssessmentProgress from './components/AssessmentProgress'
import ProfileView from './components/ProfileView'
import SearchPanel from './components/SearchPanel'
import SearchResults from './components/SearchResults'
import TopNav from './components/TopNav'

export default function App() {
  const [companyName, setCompanyName] = useState('')
  const [regNumber, setRegNumber] = useState('')
  const [jurisdiction, setJurisdiction] = useState('GB')
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [results, setResults] = useState<CompanySearchItem[] | null>(null)
  const [assessing, setAssessing] = useState(false)
  const [assessError, setAssessError] = useState<string | null>(null)
  const [profile, setProfile] = useState<CompanyRiskProfile | null>(null)
  const [assessorTracks, setAssessorTracks] = useState<AssessorTrack[]>([])

  const cancelRef = useRef<(() => void) | null>(null)

  async function handleSearch(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const name = companyName.trim()
    const number = regNumber.trim()
    if (!name && !number) return

    setSearching(true)
    setSearchError(null)
    setResults(null)
    setProfile(null)
    setAssessError(null)
    setAssessorTracks([])

    try {
      const result = await searchCompanies({ jurisdiction, name, number })
      setResults(result.data)
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Something went wrong while searching. Please try again.')
    } finally {
      setSearching(false)
    }
  }

  function handleSelectCompany(company: CompanySearchItem) {
    // Close any in-flight assessment
    cancelRef.current?.()

    setAssessing(true)
    setAssessError(null)
    setProfile(null)
    setAssessorTracks(INITIAL_TRACKS.map(t => ({ ...t })))

    const cancel = startRiskAssessment(company, {
      onTrackUpdate: (source, status, message) => {
        setAssessorTracks(prev => prev.map(track =>
          track.source === source ? { ...track, status, message } : track
        ))
      },
      onResult: (data) => setProfile(data),
      onError: (message) => {
        setAssessError(message)
        setAssessorTracks(prev => prev.map(track =>
          track.status === 'pending' ? { ...track, status: 'error', message } : track
        ))
      },
      onDone: () => setAssessing(false),
    })

    cancelRef.current = cancel
  }

  function clearSearch() {
    setCompanyName(''); setRegNumber(''); setResults(null);
    setProfile(null); setSearchError(null); setAssessError(null); setAssessorTracks([]);
  }

  return (
    <div className="app">
      <TopNav />

      <main className="main">
        <SearchPanel
          companyName={companyName} setCompanyName={setCompanyName}
          regNumber={regNumber} setRegNumber={setRegNumber}
          jurisdiction={jurisdiction} setJurisdiction={setJurisdiction}
          searching={searching} assessing={assessing}
          onSearch={handleSearch}
          onClear={clearSearch}
        />

        {searchError && (
          <div className="alert alert-error">
            <span className="alert-icon">&#9888;</span>
            {searchError}
          </div>
        )}

        <SearchResults
          results={results}
          assessing={assessing}
          profile={profile}
          onSelectCompany={handleSelectCompany}
        />

        {assessorTracks.length > 0 && <AssessmentProgress tracks={assessorTracks} />}

        {assessError && (
          <div className="alert alert-error">
            <span className="alert-icon">&#9888;</span>
            {assessError}
          </div>
        )}

        {profile && <ProfileView profile={profile} />}
      </main>
    </div>
  )
}
