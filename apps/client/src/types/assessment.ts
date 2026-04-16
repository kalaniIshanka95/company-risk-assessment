import { SSEEventSource } from '@/packages/shared/types/serverSendEvents'

export type TrackStatus = 'pending' | 'success' | 'error'

export type AssessorTrack = {
  source: SSEEventSource
  label: string
  status: TrackStatus
  message?: string
}

export const INITIAL_TRACKS: AssessorTrack[] = [
  { source: SSEEventSource.COMPANY_DETAILS, label: 'Companies House', status: 'pending' },
  { source: SSEEventSource.SANCTIONS, label: 'Sanctions Screening', status: 'pending' },
  { source: SSEEventSource.WEBSEARCH, label: 'Web Search', status: 'pending' },
  { source: SSEEventSource.AI_ANALYSIS, label: 'AI Analysis', status: 'pending' },
]
