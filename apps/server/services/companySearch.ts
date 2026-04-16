import { searchCompaniesProvider } from 'providers/mock';
import { CompanySearchResponse, CompanySearchItem, RawCompanySearchItem } from '../types';

// Maps the raw provider format to the normalised CompanySearchItem used across the app.
function toCompanySearchItem({ id, jurisdiction, details: c }: RawCompanySearchItem): CompanySearchItem {
  return {
    companyId: id,
    name: c.company_name,
    number: c.company_number,
    jurisdiction,
    status: c.company_status as CompanySearchItem['status'],
    incorporationDate: c.date_of_creation,
    address: [
      c.registered_office_address.address_line_1,
      c.registered_office_address.locality,
      c.registered_office_address.postal_code,
    ].filter(Boolean).join(', '),
  };
}

export async function searchCompanies(
  query: string,
  jurisdiction: string,
  page: number = 1,
  limit: number = 10,
): Promise<CompanySearchResponse> {
  const { items, total } = await searchCompaniesProvider(query.trim(), jurisdiction, page, limit);

  return { data: items.map(toCompanySearchItem), total };
}
