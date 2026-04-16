import type { CompanyRiskProfile } from './riskProfile';

export enum SSEEventStatus {
    PENDING = 'pending',
    SUCCESS = 'success',
    ERROR   = 'error',
}

export enum SSEEventSource {
    COMPANY_DETAILS = 'company_details',
    SANCTIONS       = 'sanctions',
    WEBSEARCH       = 'websearch',
    AI_ANALYSIS     = 'ai_analysis',
}

export type SSEEvent =
    | { status: SSEEventStatus.PENDING }
    | { status: SSEEventStatus.SUCCESS; source: SSEEventSource.COMPANY_DETAILS }
    | { status: SSEEventStatus.SUCCESS; source: SSEEventSource.SANCTIONS }
    | { status: SSEEventStatus.SUCCESS; source: SSEEventSource.WEBSEARCH }
    | { status: SSEEventStatus.SUCCESS; source: SSEEventSource.AI_ANALYSIS; data: CompanyRiskProfile }
    | { status: SSEEventStatus.ERROR; source?: SSEEventSource; message: string }
