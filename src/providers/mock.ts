import {
  IProvider,
  CompanySearchItem,
  RawCompanyDetails,
  RawSanctionsResult,
  RawWebSearchResult,
} from '../types';

// ─── Internal mock record type ────────────────────────────────────────────────

interface MockCompany {
  jurisdiction: string;
  details: RawCompanyDetails;
}

// ─── Mock raw Companies House data ────────────────────────────────────────────
// Key: `${jurisdiction}:${companyNumber}`

const MOCK_CH: Record<string, MockCompany> = {
  'GB:00445790': {
    jurisdiction: 'GB',
    details: {
      company_name: 'MARKS AND SPENCER PLC',
      company_number: '00445790',
      company_status: 'active',
      date_of_creation: '1926-09-26',
      sic_codes: ['47110'],
      registered_office_address: {
        address_line_1: 'Waterside House',
        address_line_2: '35 North Wharf Road',
        locality: 'London',
        postal_code: 'W2 1NW',
        country: 'England',
      },
      officers: [
        { name: 'NORMAN, Archie', officer_role: 'director', appointed_on: '2017-09-01', nationality: 'British', country_of_residence: 'England', number_of_directorships: 2 },
        { name: 'MACHIN, Stuart', officer_role: 'director', appointed_on: '2022-05-25', nationality: 'British', country_of_residence: 'England', number_of_directorships: 1 },
      ],
      filing_history: [
        { type: 'CS01', date: '2024-09-26', description: 'Confirmation statement with no updates', overdue: false },
        { type: 'AA', date: '2024-01-31', description: 'Annual accounts', overdue: false },
      ],
    },
  },
  'GB:12345678': {
    jurisdiction: 'GB',
    details: {
      company_name: 'ACME CONSULTING LTD',
      company_number: '12345678',
      company_status: 'active',
      date_of_creation: '2015-03-12',
      sic_codes: ['70220'],
      registered_office_address: {
        address_line_1: '1 Business Park',
        locality: 'Manchester',
        postal_code: 'M1 1AA',
        country: 'England',
      },
      officers: [
        { name: 'SMITH, John', officer_role: 'director', appointed_on: '2015-03-12', nationality: 'British', country_of_residence: 'England', number_of_directorships: 5 },
      ],
      filing_history: [
        { type: 'AA', date: '2022-03-31', description: 'Annual accounts', overdue: true },
        { type: 'CS01', date: '2023-03-12', description: 'Confirmation statement with no updates', overdue: false },
      ],
    },
  },
  'GB:99999999': {
    jurisdiction: 'GB',
    details: {
      company_name: 'DISSOLVED VENTURES LTD',
      company_number: '99999999',
      company_status: 'dissolved',
      date_of_creation: '2010-06-01',
      sic_codes: ['64202'],
      registered_office_address: {
        address_line_1: '5 Old Street',
        locality: 'London',
        postal_code: 'EC1V 9HX',
        country: 'England',
      },
      officers: [
        { name: 'DOE, Jane', officer_role: 'director', appointed_on: '2010-06-01', resigned_on: '2019-01-15', nationality: 'British', country_of_residence: 'England', number_of_directorships: 0 },
      ],
      filing_history: [
        { type: 'DS01', date: '2019-06-01', description: 'Application to strike off', overdue: false },
      ],
    },
  },
  'GB:11111111': {
    jurisdiction: 'GB',
    details: {
      company_name: 'SANCTIONED ENTITY LTD',
      company_number: '11111111',
      company_status: 'active',
      date_of_creation: '2005-01-10',
      sic_codes: ['64190'],
      registered_office_address: {
        address_line_1: '99 Restricted Road',
        locality: 'London',
        postal_code: 'E1 1ZZ',
        country: 'England',
      },
      officers: [
        { name: 'PETROV, Viktor', officer_role: 'director', appointed_on: '2005-01-10', nationality: 'Russian', country_of_residence: 'Russia', number_of_directorships: 8 },
      ],
      filing_history: [
        { type: 'CS01', date: '2024-01-10', description: 'Confirmation statement with no updates', overdue: false },
        { type: 'AA', date: '2023-12-31', description: 'Annual accounts', overdue: false },
      ],
    },
  },
};

// ─── Mock ComplyAdvantage sanctions data ──────────────────────────────────────
// Key: `${jurisdiction}:${companyNumber}`

const MOCK_SANCTIONS: Record<string, RawSanctionsResult> = {
  'GB:00445790': { data: { total_hits: 0, hits: [] } },
  'GB:12345678': { data: { total_hits: 0, hits: [] } },
  'GB:99999999': { data: { total_hits: 0, hits: [] } },
  'GB:11111111': {
    data: {
      total_hits: 1,
      hits: [
        {
          doc: {
            name: 'SANCTIONED ENTITY LTD',
            entity_type: 'company',
            sources: ['GB HMT Sanctions List', 'EU Consolidated Sanctions List'],
            types: ['sanction'],
            aka: ['Sanctioned Entity Limited'],
          },
          match_types: ['name_exact'],
        },
      ],
    },
  },
};

// ─── Mock web search results ──────────────────────────────────────────────────
// Key: `${jurisdiction}:${companyNumber}`

const MOCK_WEB: Record<string, RawWebSearchResult[]> = {
  'GB:00445790': [
    { title: 'Marks and Spencer PLC - Company Overview', snippet: 'Marks and Spencer PLC is a major British multinational retailer headquartered in London. The company specialises in selling clothing, home products and food products.', url: 'https://en.wikipedia.org/wiki/Marks_%26_Spencer', published_date: '2024-01-01' },
    { title: 'M&S reports strong annual results for 2024', snippet: 'Marks and Spencer delivered strong full-year results, with food and clothing divisions both performing ahead of expectations.', url: 'https://example.com/news/ms-results-2024', published_date: '2024-05-22' },
  ],
  'GB:12345678': [
    { title: 'Acme Consulting Ltd faces HMRC investigation', snippet: 'Acme Consulting Ltd has been named in an HMRC investigation over unpaid taxes and irregularities in annual filings. The company has failed to file accounts on time for two consecutive years.', url: 'https://example.com/news/acme-hmrc-probe', published_date: '2023-11-01' },
    { title: 'Director John Smith linked to multiple dissolved companies', snippet: 'John Smith, director of Acme Consulting Ltd, is listed as a director of 5 companies, two of which were dissolved under investigation.', url: 'https://example.com/news/john-smith-director', published_date: '2023-08-15' },
  ],
  'GB:99999999': [
    { title: 'Dissolved Ventures Ltd struck off Companies House register', snippet: 'Dissolved Ventures Ltd has been removed from the Companies House register following an application to strike off. The company had been dormant since 2018.', url: 'https://example.com/news/dissolved-ventures', published_date: '2019-07-01' },
  ],
  'GB:11111111': [
    { title: 'UK Treasury sanctions Sanctioned Entity Ltd', snippet: 'The UK government has added Sanctioned Entity Ltd to its financial sanctions list following evidence of involvement in financial crimes. The company director Viktor Petrov is also subject to personal sanctions.', url: 'https://example.com/news/sanctioned-entity-hmt', published_date: '2022-03-15' },
    { title: 'EU adds Sanctioned Entity Ltd to consolidated sanctions list', snippet: 'The European Union has added Sanctioned Entity Ltd to its consolidated sanctions list, citing links to money laundering operations.', url: 'https://example.com/news/sanctioned-entity-eu', published_date: '2022-04-01' },
  ],
};

// ─── Mock provider ────────────────────────────────────────────────────────────

function key(jurisdiction: string, companyId: string): string {
  return `${jurisdiction}:${companyId}`;
}

export class MockProvider implements IProvider {
  async searchCompanies(query: string, jurisdiction: string): Promise<CompanySearchItem[]> {
    const q = query.toLowerCase();
    return Object.values(MOCK_CH)
      .filter(({ jurisdiction: j, details: c }) =>
        j === jurisdiction &&
        (c.company_name.toLowerCase().includes(q) || c.company_number === query)
      )
      .map(({ jurisdiction: j, details: c }) => ({
        companyId: c.company_number,
        name: c.company_name,
        number: c.company_number,
        numbers: [c.company_number],
        jurisdiction: j,
        status: c.company_status as CompanySearchItem['status'],
        incorporationDate: c.date_of_creation,
        address: [
          c.registered_office_address.address_line_1,
          c.registered_office_address.locality,
          c.registered_office_address.postal_code,
        ].filter(Boolean).join(', '),
      }));
  }

  async getCompanyDetails(companyId: string, jurisdiction: string): Promise<RawCompanyDetails | null> {
    return MOCK_CH[key(jurisdiction, companyId)]?.details ?? null;
  }

  async getSanctions(companyId: string, jurisdiction: string): Promise<RawSanctionsResult> {
    return MOCK_SANCTIONS[key(jurisdiction, companyId)] ?? { data: { total_hits: 0, hits: [] } };
  }

  async getWebSearch(companyId: string, jurisdiction: string): Promise<RawWebSearchResult[]> {
    return MOCK_WEB[key(jurisdiction, companyId)] ?? [];
t  }
}
