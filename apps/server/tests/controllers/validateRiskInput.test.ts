import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { validateRiskInput } from '../../controllers/risk/validateRiskInput';

function makeReq(query: Record<string, unknown>): Request {
  return { query } as unknown as Request;
}

function makeRes() {
  const res = {
    status: vi.fn(),
    json: vi.fn()
  };
  res.status.mockReturnValue(res);
  return res as unknown as Response;
}

describe('validateRiskInput', () => {
  let next: NextFunction;

  beforeEach(() => {
    next = vi.fn();
  });

  it('calls next() for a valid request', () => {
    const req = makeReq({
      companyId: '00445790',
      registrationNumber: '00445790',
      companyName: 'Marks and Spencer PLC',
      jurisdiction: 'GB',
    });
    const res = makeRes();

    validateRiskInput(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns error when companyId is missing', () => {
    const req = makeReq({
      registrationNumber: '00445790',
      companyName: 'Marks and Spencer PLC',
      jurisdiction: 'GB',
    });
    const res = makeRes();

    validateRiskInput(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns error when companyName is missing', () => {
    const req = makeReq({
      companyId: '00445790',
      registrationNumber: '00445790',
      jurisdiction: 'GB',
    });
    const res = makeRes();

    validateRiskInput(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns error when jurisdiction is invalid', () => {
    const req = makeReq({
      companyId: '00445790',
      registrationNumber: '00445790',
      companyName: 'Marks and Spencer PLC',
      jurisdiction: 'XX',
    });
    const res = makeRes();

    validateRiskInput(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid jurisdiction code' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns error when jurisdiction is missing', () => {
    const req = makeReq({
      companyId: '00445790',
      registrationNumber: '00445790',
      companyName: 'Marks and Spencer PLC',
    });
    const res = makeRes();

    validateRiskInput(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns error when registrationNumber is empty string', () => {
    const req = makeReq({
      companyId: '00445790',
      registrationNumber: '   ',
      companyName: 'Marks and Spencer PLC',
      jurisdiction: 'GB',
    });
    const res = makeRes();

    validateRiskInput(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });
});
