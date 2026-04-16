import { describe, it, expect } from 'vitest';
import { CompanyDetailsAssessor } from '../../assessors/companyDetails';
import { RawCompanyDetails } from '../../types';

const assessor = new CompanyDetailsAssessor();
// Access protected method via cast
const map = (raw: RawCompanyDetails | null) => (assessor as any).map(raw);

const baseRaw: RawCompanyDetails = {
  company_name: 'ACME LTD',
  company_number: '12345678',
  company_status: 'active',
  date_of_creation: '2015-01-01',
  sic_codes: ['70220'],
  registered_office_address: {
    address_line_1: '1 Test Street',
    address_line_2: 'Floor 2',
    locality: 'London',
    postal_code: 'EC1A 1BB',
    country: 'England',
  },
  officers: [
    { name: 'SMITH, John', officer_role: 'director', appointed_on: '2015-01-01', nationality: 'British', number_of_directorships: 2 },
  ],
  filing_history: [
    { type: 'AA', date: '2024-01-31', description: 'Annual accounts', overdue: false },
    { type: 'AA', date: '2023-01-31', description: 'Annual accounts', overdue: false },
    { type: 'CS01', date: '2024-06-01', description: 'Confirmation statement', overdue: false },
  ],
};

describe('CompanyDetailsAssessor.map', () => {
  it('returns null when raw is null', () => {
    expect(map(null)).toBeNull();
  });

  it('maps basic company fields', () => {
    const result = map(baseRaw);
    expect(result?.companyName).toBe('ACME LTD');
    expect(result?.registrationNumber).toBe('12345678');
    expect(result?.companyStatus).toBe('active');
    expect(result?.incorporationDate).toBe('2015-01-01');
  });

  it('joins address parts filtering out blank fields', () => {
    const result = map(baseRaw);
    expect(result?.registeredAddress).toBe('1 Test Street, Floor 2, London, EC1A 1BB, England');
  });

  it('omits missing address parts', () => {
    const raw: RawCompanyDetails = { ...baseRaw, registered_office_address: { address_line_1: '1 Test Street', postal_code: 'EC1A 1BB' } };
    const result = map(raw);
    expect(result?.registeredAddress).toBe('1 Test Street, EC1A 1BB');
  });

  it('picks the most recent AA filing as lastAccountsDate', () => {
    const result = map(baseRaw);
    expect(result?.lastAccountsDate).toBe('2024-01-31');
  });

  it('sets lastAccountsDate to null when no AA filings', () => {
    const raw: RawCompanyDetails = { ...baseRaw, filing_history: [{ type: 'CS01', date: '2024-06-01' }] };
    const result = map(raw);
    expect(result?.lastAccountsDate).toBeNull();
  });

  it('sets hasOverdueFilings to true when any filing is overdue', () => {
    const raw: RawCompanyDetails = { ...baseRaw, filing_history: [{ type: 'AA', date: '2022-01-31', overdue: true }] };
    const result = map(raw);
    expect(result?.hasOverdueFilings).toBe(true);
  });

  it('sets hasOverdueFilings to false when no filings are overdue', () => {
    const result = map(baseRaw);
    expect(result?.hasOverdueFilings).toBe(false);
  });

  it('maps all officers', () => {
    const result = map(baseRaw);
    expect(result?.officers).toHaveLength(1);
    expect(result?.officers[0]).toMatchObject({ name: 'SMITH, John', role: 'director', nationality: 'British', otherCompanyCount: 2 });
  });
});
