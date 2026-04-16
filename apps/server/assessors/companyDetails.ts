import { getCompanyDetailsProvider } from '../providers/mock';
import { RawCompanyDetails, CompanyRegistryData } from '../types';
import { DataSource, AssessmentContext, SSEEventSource } from './index';

export class CompanyDetailsAssessor extends DataSource<RawCompanyDetails | null, CompanyRegistryData | null> {
  readonly name = 'Company House';
  readonly source = SSEEventSource.COMPANY_DETAILS;

  protected map(raw: RawCompanyDetails | null): CompanyRegistryData | null {
    if (!raw) return null;

    const addr = raw.registered_office_address;
    const registeredAddress = [addr.address_line_1, addr.address_line_2, addr.locality, addr.postal_code, addr.country]
      .filter(Boolean)
      .join(', ');

    const filings = raw.filing_history.map((f) => ({
      type: f.type,
      date: f.date,
      description: f.description,
      isOverdue: f.overdue ?? false,
    }));

    // 'AA' is the Companies House code for annual accounts filings.
    // Sort descending by date to get the most recent one.
    const lastAccountsDate = raw.filing_history
      .filter((f) => f.type === 'AA')
      .sort((a, b) => b.date.localeCompare(a.date))[0]?.date ?? null;

    return {
      companyName: raw.company_name,
      registrationNumber: raw.company_number,
      companyStatus: raw.company_status as CompanyRegistryData['companyStatus'],
      incorporationDate: raw.date_of_creation,
      registeredAddress,
      officers: raw.officers.map((o) => ({
        name: o.name,
        role: o.officer_role,
        appointedOn: o.appointed_on,
        resignedOn: o.resigned_on ?? null,
        nationality: o.nationality,
        otherCompanyCount: o.number_of_directorships,
      })),
      filings,
      hasOverdueFilings: filings.some((f) => f.isOverdue),
      lastAccountsDate,
    };
  }

  protected async fetch(context: AssessmentContext): Promise<RawCompanyDetails | null> {
    return getCompanyDetailsProvider(context.companyId, context.jurisdiction);
  }
}
