import type { CompanySearchItem } from '../types'

export function fmt(val: string | null | undefined): string {
  return val ?? '—'
}

export function fmtDate(val: string | null | undefined): string {
  if (!val) return '—'
  try {
    return new Date(val).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return val
  }
}

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })

export function fmtJurisdiction(code: string | null | undefined): string {
  if (!code) return '—'
  try {
    return regionNames.of(code) ?? code
  } catch {
    return code
  }
}

export function statusColor(status: CompanySearchItem['status']): string {
  return (
    { active: 'badge-green', dissolved: 'badge-red', dormant: 'badge-yellow', liquidation: 'badge-orange', unknown: 'badge-gray' }[status] ?? 'badge-gray'
  )
}
