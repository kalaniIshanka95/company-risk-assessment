import { describe, it, expect } from 'vitest';
import { SanctionsAssessor } from '../../assessors/sanctions';
import { RawSanctionsResult } from '../../types';

const assessor = new SanctionsAssessor();
const map = (raw: RawSanctionsResult) => (assessor as any).map(raw);

describe('SanctionsAssessor.map', () => {
  it('returns isOnSanctionsList false when total_hits is 0', () => {
    const raw: RawSanctionsResult = { data: { total_hits: 0, hits: [] } };
    expect(map(raw).isOnSanctionsList).toBe(false);
  });

  it('returns isOnSanctionsList true when total_hits is greater than 0', () => {
    const raw: RawSanctionsResult = {
      data: {
        total_hits: 1,
        hits: [{ doc: { name: 'BAD CORP', entity_type: 'company', sources: ['GB HMT'], types: ['sanction'], aka: [] }, match_types: ['name_exact'] }],
      },
    };
    expect(map(raw).isOnSanctionsList).toBe(true);
  });

  it('flattens sources from all hits into lists', () => {
    const raw: RawSanctionsResult = {
      data: {
        total_hits: 2,
        hits: [
          { doc: { name: 'BAD CORP', entity_type: 'company', sources: ['GB HMT', 'EU Consolidated'], types: ['sanction'], aka: [] }, match_types: ['name_exact'] },
          { doc: { name: 'BAD CORP LTD', entity_type: 'company', sources: ['OFAC SDN'], types: ['sanction'], aka: [] }, match_types: ['name_fuzzy'] },
        ],
      },
    };
    const result = map(raw);
    expect(result.lists).toEqual(['GB HMT', 'EU Consolidated', 'OFAC SDN']);
  });

  it('returns empty lists when no hits', () => {
    const raw: RawSanctionsResult = { data: { total_hits: 0, hits: [] } };
    expect(map(raw).lists).toEqual([]);
  });
});
