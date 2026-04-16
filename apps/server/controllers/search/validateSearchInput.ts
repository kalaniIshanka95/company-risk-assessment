import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { JURISDICTION_CODES } from '@/packages/shared/types/jurisdictions';

const SearchQuerySchema = z.object({
    name: z.string().trim().min(2, 'Company name must be at least 2 characters').optional(),
    number: z.string().trim().min(1).optional(),
    jurisdiction: z.enum(JURISDICTION_CODES, { error: 'Invalid jurisdiction code' }),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
}).refine(data => data.name || data.number, {
    message: 'Provide a company name, registration number, or both',
});

export type SearchQuery = z.infer<typeof SearchQuerySchema>;

export const validateSearchInput = (req: Request, res: Response, next: NextFunction): void => {
    const result = SearchQuerySchema.safeParse(req.query);
    if (!result.success) {
        res.status(400).json({ error: result.error.issues[0]?.message ?? 'Invalid request' });
        return;
    }
    next();
};
