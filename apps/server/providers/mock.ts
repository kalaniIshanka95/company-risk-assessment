import {
  RawCompanySearchItem,
  RawCompanyDetails,
  RawSanctionsResult,
  RawWebSearchResult,
} from '../types';

// Internal mock record type

interface MockCompany {
  id: string;
  jurisdiction: string;
  details: RawCompanyDetails;
}

// Mock raw Companies House data
const MOCK_COMPANY_DATA: MockCompany[] = [
  {
    id: 'GB:00445790',
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
  {
    id: 'GB:12345678',
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
  {
    id: 'GB:99999999',
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
  {
    id: 'GB:11111111',
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
  {
    id: 'GB:22222222',
    jurisdiction: 'GB',
    details: {
      company_name: 'TECH SOLUTIONS LTD',
      company_number: '22222222',
      company_status: 'active',
      date_of_creation: '2018-07-15',
      sic_codes: ['62020'],
      registered_office_address: {
        address_line_1: '10 Silicon Way',
        locality: 'Cambridge',
        postal_code: 'CB1 2AB',
        country: 'England',
      },
      officers: [
        { name: 'PATEL, Raj', officer_role: 'director', appointed_on: '2018-07-15', nationality: 'British', country_of_residence: 'England', number_of_directorships: 2 },
      ],
      filing_history: [
        { type: 'CS01', date: '2024-07-15', description: 'Confirmation statement with no updates', overdue: false },
        { type: 'AA', date: '2023-12-31', description: 'Annual accounts', overdue: false },
      ],
    },
  },
  {
    id: 'GB:33333333',
    jurisdiction: 'GB',
    details: {
      company_name: 'GLOBAL IMPORTS LTD',
      company_number: '33333333',
      company_status: 'dormant',
      date_of_creation: '2012-04-20',
      sic_codes: ['46900'],
      registered_office_address: {
        address_line_1: '4 Harbour View',
        locality: 'Bristol',
        postal_code: 'BS1 4RB',
        country: 'England',
      },
      officers: [
        { name: 'JONES, David', officer_role: 'director', appointed_on: '2012-04-20', nationality: 'British', country_of_residence: 'England', number_of_directorships: 3 },
      ],
      filing_history: [
        { type: 'AA', date: '2021-04-30', description: 'Annual accounts (dormant)', overdue: true },
        { type: 'CS01', date: '2022-04-20', description: 'Confirmation statement with no updates', overdue: false },
      ],
    },
  },
  {
    id: 'GB:44444444',
    jurisdiction: 'GB',
    details: {
      company_name: 'PHOENIX HOLDINGS LTD',
      company_number: '44444444',
      company_status: 'liquidation',
      date_of_creation: '2008-11-03',
      sic_codes: ['64205'],
      registered_office_address: {
        address_line_1: '2 Creditors Lane',
        locality: 'Birmingham',
        postal_code: 'B1 1BB',
        country: 'England',
      },
      officers: [
        { name: 'BROWN, Sarah', officer_role: 'director', appointed_on: '2008-11-03', nationality: 'British', country_of_residence: 'England', number_of_directorships: 1 },
        { name: 'LIQUIDATORS INC', officer_role: 'liquidator', appointed_on: '2023-06-01', nationality: 'British', country_of_residence: 'England', number_of_directorships: 0 },
      ],
      filing_history: [
        { type: 'LIQ01', date: '2023-06-01', description: 'Appointment of liquidator', overdue: false },
        { type: 'AA', date: '2022-11-30', description: 'Annual accounts', overdue: true },
      ],
    },
  },
  {
    id: 'GB:55555555',
    jurisdiction: 'GB',
    details: {
      company_name: 'NORTH STAR VENTURES LTD',
      company_number: '55555555',
      company_status: 'unknown',
      date_of_creation: '2003-09-17',
      sic_codes: ['64301'],
      registered_office_address: {
        address_line_1: '7 Mystery Court',
        locality: 'Leeds',
        postal_code: 'LS1 1AA',
        country: 'England',
      },
      officers: [
        { name: 'UNKNOWN, Person', officer_role: 'director', appointed_on: '2003-09-17', nationality: 'British', country_of_residence: 'England', number_of_directorships: 0 },
      ],
      filing_history: [],
    },
  },
  {
    id: 'GB:66666666',
    jurisdiction: 'GB',
    details: {
      company_name: 'PREMIER LOGISTICS LTD',
      company_number: '66666666',
      company_status: 'active',
      date_of_creation: '2011-02-28',
      sic_codes: ['49410'],
      registered_office_address: {
        address_line_1: '15 Freight Road',
        locality: 'Coventry',
        postal_code: 'CV1 2GH',
        country: 'England',
      },
      officers: [
        { name: 'WILLIAMS, Thomas', officer_role: 'director', appointed_on: '2011-02-28', nationality: 'British', country_of_residence: 'England', number_of_directorships: 1 },
      ],
      filing_history: [
        { type: 'CS01', date: '2024-02-28', description: 'Confirmation statement with no updates', overdue: false },
        { type: 'AA', date: '2023-12-31', description: 'Annual accounts', overdue: false },
      ],
    },
  },
  {
    id: 'GB:77777777',
    jurisdiction: 'GB',
    details: {
      company_name: 'SUNRISE PROPERTIES LTD',
      company_number: '77777777',
      company_status: 'dissolved',
      date_of_creation: '2001-05-14',
      sic_codes: ['68100'],
      registered_office_address: {
        address_line_1: '3 Sunset Boulevard',
        locality: 'Liverpool',
        postal_code: 'L1 8JQ',
        country: 'England',
      },
      officers: [
        { name: 'TAYLOR, Angela', officer_role: 'director', appointed_on: '2001-05-14', resigned_on: '2020-03-01', nationality: 'British', country_of_residence: 'England', number_of_directorships: 0 },
      ],
      filing_history: [
        { type: 'DS01', date: '2020-03-01', description: 'Application to strike off', overdue: false },
      ],
    },
  },
  {
    id: 'GB:88888888',
    jurisdiction: 'GB',
    details: {
      company_name: 'BRITISH STEEL FABRICATIONS LTD',
      company_number: '88888888',
      company_status: 'active',
      date_of_creation: '1995-08-22',
      sic_codes: ['24100'],
      registered_office_address: {
        address_line_1: '100 Industrial Estate',
        locality: 'Sheffield',
        postal_code: 'S1 2PP',
        country: 'England',
      },
      officers: [
        { name: 'HARRIS, Michael', officer_role: 'director', appointed_on: '1995-08-22', nationality: 'British', country_of_residence: 'England', number_of_directorships: 2 },
        { name: 'CLARK, Susan', officer_role: 'secretary', appointed_on: '2010-01-01', nationality: 'British', country_of_residence: 'England', number_of_directorships: 0 },
      ],
      filing_history: [
        { type: 'CS01', date: '2024-08-22', description: 'Confirmation statement with no updates', overdue: false },
        { type: 'AA', date: '2023-12-31', description: 'Annual accounts', overdue: false },
      ],
    },
  },
];

// Mock sanctions data
const MOCK_SANCTIONS: Record<string, RawSanctionsResult> = {
  'GB:MARKS AND SPENCER PLC': { data: { total_hits: 0, hits: [] } },
  'GB:ACME CONSULTING LTD': { data: { total_hits: 0, hits: [] } },
  'GB:DISSOLVED VENTURES LTD': { data: { total_hits: 0, hits: [] } },
  'GB:SANCTIONED ENTITY LTD': {
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
  'GB:TECH SOLUTIONS LTD': { data: { total_hits: 0, hits: [] } },
  'GB:GLOBAL IMPORTS LTD': { data: { total_hits: 0, hits: [] } },
  'GB:PHOENIX HOLDINGS LTD': { data: { total_hits: 0, hits: [] } },
  'GB:NORTH STAR VENTURES LTD': { data: { total_hits: 0, hits: [] } },
  'GB:PREMIER LOGISTICS LTD': { data: { total_hits: 0, hits: [] } },
  'GB:SUNRISE PROPERTIES LTD': { data: { total_hits: 0, hits: [] } },
  'GB:BRITISH STEEL FABRICATIONS LTD': { data: { total_hits: 0, hits: [] } },
  'US:ACME INNOVATIONS INC': { data: { total_hits: 0, hits: [] } },
  'US:NEVADA SHELL CORP': {
    data: {
      total_hits: 1,
      hits: [
        {
          doc: {
            name: 'NEVADA SHELL CORP',
            entity_type: 'company',
            sources: ['OFAC SDN List'],
            types: ['sanction'],
            aka: [],
          },
          match_types: ['name_exact'],
        },
      ],
    },
  },
  'DE:BERLIN TECH GMBH': { data: { total_hits: 0, hits: [] } },
  'DE:RHEIN LOGISTICS GMBH': { data: { total_hits: 0, hits: [] } },
};

// Mock web search results
const MOCK_WEB: Record<string, RawWebSearchResult[]> = {
  'GB:MARKS AND SPENCER PLC': [
    { title: 'Marks and Spencer PLC - Company Overview', snippet: 'Marks and Spencer PLC is a major British multinational retailer headquartered in London. The company specialises in selling clothing, home products and food products.', url: 'https://en.wikipedia.org/wiki/Marks_%26_Spencer', published_date: '2024-01-01' },
    { title: 'M&S reports strong annual results for 2024', snippet: 'Marks and Spencer delivered strong full-year results, with food and clothing divisions both performing ahead of expectations.', url: 'https://example.com/news/ms-results-2024', published_date: '2024-05-22' },
  ],
  'GB:ACME CONSULTING LTD': [
    { title: 'Acme Consulting Ltd faces HMRC investigation', snippet: 'Acme Consulting Ltd has been named in an HMRC investigation over unpaid taxes and irregularities in annual filings. The company has failed to file accounts on time for two consecutive years.', url: 'https://example.com/news/acme-hmrc-probe', published_date: '2023-11-01' },
    { title: 'Director John Smith linked to multiple dissolved companies', snippet: 'John Smith, director of Acme Consulting Ltd, is listed as a director of 5 companies, two of which were dissolved under investigation.', url: 'https://example.com/news/john-smith-director', published_date: '2023-08-15' },
  ],
  'GB:DISSOLVED VENTURES LTD': [
    { title: 'Dissolved Ventures Ltd struck off Companies House register', snippet: 'Dissolved Ventures Ltd has been removed from the Companies House register following an application to strike off. The company had been dormant since 2018.', url: 'https://example.com/news/dissolved-ventures', published_date: '2019-07-01' },
  ],
  'GB:SANCTIONED ENTITY LTD': [
    { title: 'UK Treasury sanctions Sanctioned Entity Ltd', snippet: 'The UK government has added Sanctioned Entity Ltd to its financial sanctions list following evidence of involvement in financial crimes. The company director Viktor Petrov is also subject to personal sanctions.', url: 'https://example.com/news/sanctioned-entity-hmt', published_date: '2022-03-15' },
    { title: 'EU adds Sanctioned Entity Ltd to consolidated sanctions list', snippet: 'The European Union has added Sanctioned Entity Ltd to its consolidated sanctions list, citing links to money laundering operations.', url: 'https://example.com/news/sanctioned-entity-eu', published_date: '2022-04-01' },
  ],
  'GB:TECH SOLUTIONS LTD': [
    { title: 'Tech Solutions Ltd wins government contract', snippet: 'Cambridge-based Tech Solutions Ltd has been awarded a £2m public sector software contract.', url: 'https://example.com/news/tech-solutions-contract', published_date: '2023-09-10' },
  ],
  'GB:GLOBAL IMPORTS LTD': [
    { title: 'Global Imports Ltd files for dormancy', snippet: 'The Bristol importer has ceased trading and filed dormant accounts with Companies House.', url: 'https://example.com/news/global-imports-dormant', published_date: '2021-05-01' },
  ],
  'GB:PHOENIX HOLDINGS LTD': [
    { title: 'Phoenix Holdings Ltd enters liquidation', snippet: 'Creditors of Phoenix Holdings Ltd have appointed a liquidator after the company failed to repay £4m in outstanding debts.', url: 'https://example.com/news/phoenix-holdings-liquidation', published_date: '2023-06-15' },
  ],
  'GB:NORTH STAR VENTURES LTD': [],
  'GB:PREMIER LOGISTICS LTD': [
    { title: 'Premier Logistics Ltd expands Midlands fleet', snippet: 'Coventry-based haulier Premier Logistics Ltd has added 20 vehicles to its fleet following strong demand.', url: 'https://example.com/news/premier-logistics-fleet', published_date: '2024-01-20' },
  ],
  'GB:SUNRISE PROPERTIES LTD': [
    { title: 'Sunrise Properties Ltd struck off register', snippet: 'The Liverpool property firm was struck off Companies House after failing to file accounts for three consecutive years.', url: 'https://example.com/news/sunrise-properties-struck-off', published_date: '2020-04-01' },
  ],
  'GB:BRITISH STEEL FABRICATIONS LTD': [
    { title: 'British Steel Fabrications Ltd secures export deal', snippet: 'The Sheffield-based manufacturer has secured a multi-year supply agreement with a European automotive group.', url: 'https://example.com/news/bsf-export-deal', published_date: '2024-02-10' },
  ],
  'US:ACME INNOVATIONS INC': [
    { title: 'Acme Innovations Inc raises Series B', snippet: 'The Cupertino software firm closed a $30m Series B round to accelerate enterprise expansion.', url: 'https://example.com/news/acme-innovations-series-b', published_date: '2023-07-18' },
  ],
  'US:NEVADA SHELL CORP': [
    { title: 'OFAC adds Nevada Shell Corp to SDN list', snippet: 'The US Treasury has designated Nevada Shell Corp under its financial sanctions programme for alleged money laundering.', url: 'https://example.com/news/nevada-shell-ofac', published_date: '2021-11-05' },
  ],
  'DE:BERLIN TECH GMBH': [
    { title: 'Berlin Tech GmbH opens new R&D centre', snippet: 'The Berlin-based software firm has opened a new research facility employing 50 engineers.', url: 'https://example.com/news/berlin-tech-rd', published_date: '2023-03-22' },
  ],
  'DE:RHEIN LOGISTICS GMBH': [
    { title: 'Rhein Logistics GmbH liquidated after insolvency', snippet: 'The Cologne logistics firm was formally dissolved following insolvency proceedings.', url: 'https://example.com/news/rhein-logistics-insolvency', published_date: '2022-12-01' },
  ],
};

const key = (jurisdiction: string, name: string): string => {
  return `${jurisdiction}:${name}`;
}

export const searchCompaniesProvider = async (query: string, jurisdiction: string, page: number, limit: number): Promise<{ items: RawCompanySearchItem[]; total: number }> => {
  const q = query.toLowerCase();
  const all = MOCK_COMPANY_DATA
    .filter(({ jurisdiction: j, details: company }) =>
      j === jurisdiction &&
      (company.company_name.toLowerCase().includes(q) || company.company_number === query)
    )
    .map(({ id, jurisdiction: j, details }) => ({ id, jurisdiction: j, details }));

  const start = (page - 1) * limit;
  return { items: all.slice(start, start + limit), total: all.length };
}

export const getCompanyDetailsProvider = async (companyId: string, jurisdiction: string): Promise<RawCompanyDetails | null> => {
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 5000));
  return MOCK_COMPANY_DATA.find(c => c.jurisdiction === jurisdiction && c.id === companyId)?.details ?? null;
}

export const getSanctions = async (companyName: string, _registrationNumber: string, jurisdiction: string): Promise<RawSanctionsResult> => {
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  return MOCK_SANCTIONS[key(jurisdiction, companyName.toUpperCase())] ?? { data: { total_hits: 0, hits: [] } };
}

export const getWebSearch = async (companyName: string, _registrationNumber: string, jurisdiction: string): Promise<RawWebSearchResult[]> => {
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 7000));
  return MOCK_WEB[key(jurisdiction, companyName.toUpperCase())] ?? [];
}
