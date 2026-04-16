import { Request, Response } from 'express';
import { searchCompanies } from '../../services/companySearch';
import { SearchQuery } from './validateSearchInput';
import { CompanySearchResponse } from '../../types';

export const searchCompaniesHandler = async (req: Request, res: Response): Promise<void> => {
  const { name, number, jurisdiction, page, limit } = req.query as unknown as SearchQuery;

  let data, total;
  if (number && name) {
    const [byNumber, byName] = await Promise.allSettled([
      searchCompanies(number, jurisdiction, page, limit),
      searchCompanies(name, jurisdiction, page, limit),
    ]);

    // Merge fulfilled results and remove duplicates by companyId.
    const seen = new Set<string>();
    const merged = [byNumber, byName]
      .filter((result): result is PromiseFulfilledResult<CompanySearchResponse> => result.status === 'fulfilled')
      .flatMap(result => result.value.data)
      .filter(company => {
        if (seen.has(company.companyId)) return false;
        seen.add(company.companyId);
        return true;
      });

    data = merged;
    total = merged.length;
  } else {
    ({ data, total } = await searchCompanies(number ?? name!, jurisdiction, page, limit));
  }

  res.json({ data, total, page, limit });
};
