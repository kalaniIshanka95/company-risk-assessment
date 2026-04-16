import type { CompanySearchItem, CompanyRiskProfile } from '../types'
import { SSEEventStatus, SSEEventSource } from '@/packages/shared/types/serverSendEvents'
import type { TrackStatus } from '../types/assessment'

const AUTH_HEADER = { 'x-auth-secret': import.meta.env.VITE_AUTH_SECRET }

export interface SearchParams {
  jurisdiction: string
  name?: string
  number?: string
  page?: number
  limit?: number
}

export interface SearchResult {
  data: CompanySearchItem[]
}

export async function searchCompanies(params: SearchParams): Promise<SearchResult> {
  const query = new URLSearchParams({ jurisdiction: params.jurisdiction })
  if (params.name) query.set('name', params.name)
  if (params.number) query.set('number', params.number)
  if (params.page != null) query.set('page', String(params.page))
  if (params.limit != null) query.set('limit', String(params.limit))

  try {
    const res = await fetch(`/companies/search?${query}`, {
      method: 'GET',
      headers: { Accept: 'application/json', ...AUTH_HEADER },
    })
    const json = await res.json()

    if (!res.ok) {
      throw new Error(json.error ?? 'Search failed')
    }

    return { data: json.data ?? [] }
  } catch (err) {
    throw err instanceof Error ? err : new Error('Search failed')
  }
}

export interface AssessmentHandlers {
  onTrackUpdate: (source: SSEEventSource, status: TrackStatus, message?: string) => void
  onResult: (profile: CompanyRiskProfile) => void
  onError: (message: string) => void
  onDone: () => void
}

export function startRiskAssessment(
  company: CompanySearchItem,
  handlers: AssessmentHandlers,
): () => void {
  const params = new URLSearchParams({
    companyId: company.companyId,
    registrationNumber: company.number,
    companyName: company.name,
    jurisdiction: company.jurisdiction,
  })

  const es = new EventSource(`/risk-assessment?${params}`)
  let receivedResult = false
  let cancelled = false

  function finish() {
    es.close()
    handlers.onDone()
  }

  es.onmessage = (event) => {
    try {
      const evt = JSON.parse(event.data)

      const { status, source, data, message } = evt

      if (status === SSEEventStatus.ERROR) {
        if (source != null) {
          handlers.onTrackUpdate(source as SSEEventSource, 'error', message ?? 'Failed to retrieve data')
        } else {
          handlers.onError(message ?? 'An unexpected error occurred')
          finish()
        }
      } else if (status === SSEEventStatus.SUCCESS) {
        if (source === SSEEventSource.AI_ANALYSIS && data != null) {
          receivedResult = true
          handlers.onResult(data as CompanyRiskProfile)
          finish()
        } else if (source != null) {
          handlers.onTrackUpdate(source as SSEEventSource, 'success')
        }
      }
    } catch (err) {
      console.error('Error from es onmessage:', err);
    }
  };

  es.onerror = () => {
    if (cancelled) return
    if (!receivedResult) {
      handlers.onError('Connection lost during assessment')
      finish()
    }
  }

  return () => {
    cancelled = true
    es.close()
  }
}
