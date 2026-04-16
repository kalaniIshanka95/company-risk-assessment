import { describe, it, expect } from 'vitest';
import { searchCompanies } from '../../services/companySearch';

describe('searchCompanies', () => {
  it('returns matching companies by name', async () => {
    const { data, total } = await searchCompanies('marks', 'GB');

    expect(total).toBe(1);
    expect(data[0].name).toBe('MARKS AND SPENCER PLC');
    expect(data[0].number).toBe('00445790');
    expect(data[0].jurisdiction).toBe('GB');
  });

  it('returns matching companies by registration number', async () => {
    const { data, total } = await searchCompanies('12345678', 'GB');

    expect(total).toBe(1);
    expect(data[0].name).toBe('ACME CONSULTING LTD');
  });

  it('returns empty results when no match found', async () => {
    const { data, total } = await searchCompanies('nonexistent company xyz', 'GB');

    expect(total).toBe(0);
    expect(data).toEqual([]);
  });

  it('filters by jurisdiction — same query different country returns nothing', async () => {
    const { data } = await searchCompanies('marks', 'US');

    expect(data).toEqual([]);
  });

  it('maps company fields correctly', async () => {
    const { data } = await searchCompanies('marks', 'GB');
    const company = data[0];

    expect(company).toMatchObject({
      companyId: 'GB:00445790',
      name: 'MARKS AND SPENCER PLC',
      number: '00445790',
      jurisdiction: 'GB',
      status: 'active',
      incorporationDate: '1926-09-26',
    });
    expect(company.address).toContain('Waterside House');
  });

  it('respects pagination — page and limit', async () => {
    const page1 = await searchCompanies('ltd', 'GB', 1, 2);
    const page2 = await searchCompanies('ltd', 'GB', 2, 2);

    expect(page1.data).toHaveLength(2);
    expect(page2.data).toHaveLength(2);
    expect(page1.data[0].name).not.toBe(page2.data[0].name);
  });

  it('trims whitespace from query', async () => {
    const { data } = await searchCompanies('  marks  ', 'GB');

    expect(data[0].name).toBe('MARKS AND SPENCER PLC');
  });
});
