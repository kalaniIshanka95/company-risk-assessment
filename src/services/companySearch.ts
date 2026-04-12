import { IProvider, CompanySearchResponse } from '../types';

const SEARCH_LIMIT = 30;

export async function searchCompanies(
  provider: IProvider,
  query: string,
  jurisdiction: string
): Promise<CompanySearchResponse> {
  const trimmed = query.trim();

  const results = await provider.searchCompanies(trimmed, jurisdiction);

  const capped = results.slice(0, SEARCH_LIMIT);
// think about more than 30 results return situation 
  return {
    data: capped,
    total: results.length,
    metadata: { search: 'index' },
  };
}
