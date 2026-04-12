import { Request, Response } from 'express';
import { z } from 'zod';
import { MockProvider } from '../providers/mock';
import { assessCompanyRisk } from '../services/riskAssessor';

const provider = new MockProvider();

const RiskRequestSchema = z.object({
  companyId:          z.string().trim().min(1).optional(),
  registrationNumber: z.string().trim().min(1).optional(),
  jurisdiction:       z.string().trim().min(2, 'Jurisdiction is required').default('GB'),
}).refine(data => data.companyId || data.registrationNumber, {
  message: 'companyId or registrationNumber is required',
});

export const assessCompany = async (req: Request, res: Response): Promise<void> => {
  const result = RiskRequestSchema.safeParse(req.body);

  if (!result.success) {
    const message = result.error.issues[0]?.message ?? 'Invalid request';
    res.status(400).json({ error: message });
    return;
  }

  const { companyId, registrationNumber, jurisdiction } = result.data;
  const id = (companyId ?? registrationNumber)!;

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const send = (data: object) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    await assessCompanyRisk(provider, id, jurisdiction, (event) => send(event));
  } catch {
    send({ type: 'error', message: 'An unexpected error occurred' });
  } finally {
    res.write('data: {"type":"done"}\n\n');
    res.end();
  }
};
