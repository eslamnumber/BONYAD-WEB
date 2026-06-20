import { describe, expect, it } from 'vitest';

import { matchService, serviceKeywords, type ServiceItem } from './match-service';
import type { SowDocument } from './sow-types';

const SERVICES: ServiceItem[] = [
  {
    id: 87,
    nameAr: 'تشطيبات داخلية',
    nameEn: 'Interior finishing',
    isActive: true,
    parentService: { id: 5, nameAr: 'البناء والتشطيب' },
  },
  {
    id: 90,
    nameAr: 'سباكة',
    nameEn: 'Plumbing',
    isActive: true,
    parentService: { id: 6, nameAr: 'الخدمات الفنية' },
  },
  { id: 99, nameAr: 'كهرباء', nameEn: 'Electrical', isActive: false, parentService: { id: 6 } },
  { id: 5, nameAr: 'البناء والتشطيب', nameEn: 'Build', isActive: true, parentService: null },
];

const SOW: SowDocument = {
  project_metadata: { project_type: 'تشطيب', project_name: 'تشطيب شقة' },
  scope: { work_discipline: ['تشطيبات'] },
};

describe('serviceKeywords', () => {
  it('pulls tokens from metadata + work discipline', () => {
    expect(serviceKeywords(SOW)).toEqual(expect.arrayContaining(['تشطيب', 'تشطيبات']));
  });
});

describe('matchService', () => {
  it('picks the best-scoring active subcategory and its parent category', () => {
    const match = matchService(SOW, SERVICES);
    expect(match).toEqual({ categoryId: 5, subcategoryId: 87, serviceId: 87 });
  });

  it('skips inactive subcategories and top-level categories', () => {
    const electricalOnly: SowDocument = { project_metadata: { project_type: 'كهرباء' } };
    expect(matchService(electricalOnly, SERVICES)).toBeNull();
  });

  it('returns null when nothing scores or there are no keywords', () => {
    expect(matchService({ project_metadata: { project_type: 'زجاج' } }, SERVICES)).toBeNull();
    expect(matchService({}, SERVICES)).toBeNull();
  });
});
