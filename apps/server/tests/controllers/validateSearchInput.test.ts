import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { validateSearchInput } from '../../controllers/search/validateSearchInput';

function makeReq(query: Record<string, unknown>): Request {
  return { query } as unknown as Request;
}

function makeRes() {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  };
  res.status.mockReturnValue(res);
  return res as unknown as Response;
}

describe('validateSearchInput', () => {
  let next: NextFunction;

  beforeEach(() => {
    next = vi.fn();
  });

  it('returns 400 when jurisdiction is missing', () => {
    const req = makeReq({ name: 'Acme Corp' });
    const res = makeRes();

    validateSearchInput(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 400 when jurisdiction is invalid', () => {
    const req = makeReq({ jurisdiction: 'XX', name: 'Acme Corp' });
    const res = makeRes();

    validateSearchInput(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid jurisdiction code' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 400 when neither name nor number is provided', () => {
    const req = makeReq({ jurisdiction: 'GB' });
    const res = makeRes();

    validateSearchInput(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Provide a company name, registration number, or both',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 400 when name is too short', () => {
    const req = makeReq({ jurisdiction: 'GB', name: 'A' });
    const res = makeRes();

    validateSearchInput(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Company name must be at least 2 characters',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 400 when limit exceeds 50', () => {
    const req = makeReq({ jurisdiction: 'GB', name: 'Acme Corp', limit: '100' });
    const res = makeRes();

    validateSearchInput(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });
});
