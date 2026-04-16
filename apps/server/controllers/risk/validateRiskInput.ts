import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { JURISDICTION_CODES } from '@/packages/shared/types/jurisdictions';

const RiskBodySchema = z.object({
    companyId: z.string().trim().min(1),
    registrationNumber: z.string().trim().min(1),
    companyName: z.string().trim().min(1),
    jurisdiction: z.enum(JURISDICTION_CODES, { error: 'Invalid jurisdiction code' }),
});

export type RiskBody = z.infer<typeof RiskBodySchema>;

export const validateRiskInput = (req: Request, res: Response, next: NextFunction): void => {
    const result = RiskBodySchema.safeParse(req.query);
    if (!result.success) {
        res.status(400).json({ error: result.error.issues[0]?.message ?? 'Invalid request' });
        return;
    }
    next();
};
