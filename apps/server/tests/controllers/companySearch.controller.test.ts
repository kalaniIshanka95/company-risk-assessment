import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { searchCompaniesHandler } from '../../controllers/search';

function makeReq(query: Record<string, unknown>): Request {
  return { query } as unknown as Request;
}

function makeRes() {
  const res = { json: vi.fn() };
  return res as unknown as Response;
}

describe('searchCompaniesHandler', () => {
  let res: Response;

  beforeEach(() => {
    res = makeRes();
  });

  it('responds with data, total, page, and limit', async () => {
    const req = makeReq({ jurisdiction: 'GB', name: 'marks', page: 1, limit: 10 });

    await searchCompaniesHandler(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.any(Array), total: expect.any(Number), page: 1, limit: 10 })
    );
  });

  it('merges results from both name and number when both are provided', async () => {
    const req = makeReq({ jurisdiction: 'GB', name: 'marks', number: '12345678', page: 1, limit: 10 });

    await searchCompaniesHandler(req, res);

    const result = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    const names = result.data.map((c: { name: string }) => c.name);
    expect(names).toContain('MARKS AND SPENCER PLC');
    expect(names).toContain('ACME CONSULTING LTD');
  });

  it('deduplicates results when both searches return the same company', async () => {
    const req = makeReq({ jurisdiction: 'GB', name: 'acme', number: '12345678', page: 1, limit: 10 });

    await searchCompaniesHandler(req, res);

    const result = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    const ids = result.data.map((c: { companyId: string }) => c.companyId);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it('falls back to name when number is not provided', async () => {
    const req = makeReq({ jurisdiction: 'GB', name: 'marks', page: 1, limit: 10 });

    await searchCompaniesHandler(req, res);

    const result = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(result.data[0].name).toBe('MARKS AND SPENCER PLC');
  });
});
