import type { AssessorTrack } from '../types/assessment'
import { SSEEventSource } from '@/packages/shared/types/serverSendEvents'

export default function AssessmentProgress({ tracks }: { tracks: AssessorTrack[] }) {
  return (
    <div className="assessment-progress">
      <div className="assessment-progress-title">Assessment Progress</div>
      {tracks.map((track, i) => (
        <div key={i} className={`track-item track-${track.status}`}>
          <span className="track-icon">
            {track.status === 'pending' && <span className="spinner" />}
            {track.status === 'success' && '✓'}
            {track.status === 'error'   && '✗'}
          </span>
          <div>
            <span className="track-label">{track.label}</span>
            {track.status === 'pending' && (
              <span className="track-sub">
                {track.source === SSEEventSource.AI_ANALYSIS ? 'Waiting for data sources…' : 'Fetching data…'}
              </span>
            )}
            {track.status === 'success' && (
              <span className="track-sub track-sub-success">
                {track.source === SSEEventSource.AI_ANALYSIS ? 'Analysis complete' : 'Data retrieved successfully'}
              </span>
            )}
            {track.status === 'error' && (
              <span className="track-sub track-sub-error">
                {track.message ?? 'Failed to retrieve data'}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
