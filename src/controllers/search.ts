import { Request, Response } from 'express';
import { z } from 'zod';
import { MockProvider } from '../providers/mock';
import { searchCompanies } from '../services/companySearch';

const provider = new MockProvider();

const SearchQuerySchema = z.object({
  name: z.string().trim().min(2, 'Company name must be at least 2 characters').optional(),
  number: z.string().trim().min(1).optional(),
  jurisdiction: z
    .string()
    .trim()
    .length(2, 'Must be a 2-letter country code') 

}).refine(data => data.name || data.number, {
  message: 'Provide a company name, registration number, or both',
});

export const searchCompaniesHandler = async (req: Request, res: Response): Promise<void> => {
  const result = SearchQuerySchema.safeParse(req.query);

  if (!result.success) {
    const message = result.error.issues[0]?.message ?? 'Invalid request';
    res.status(400).json({ error: message });
    return;
  }

  const { name, number, jurisdiction } = result.data;

  // Search by name and/or number, deduplicate by companyId
  const seen = new Set<string>();
  const combined: Awaited<ReturnType<typeof searchCompanies>>['data'] = [];

  const merge = (r: Awaited<ReturnType<typeof searchCompanies>>) => {
    for (const item of r.data) {
      if (!seen.has(item.companyId)) {
        seen.add(item.companyId);
        combined.push(item);
      }
    }
  };

  if (name) merge(await searchCompanies(provider, name, jurisdiction));
  if (number) merge(await searchCompanies(provider, number, jurisdiction));

  res.json({ data: combined, total: combined.length, metadata: { search: 'index' } });
};
