import { describe, expect, it } from 'vitest';

import type { Service } from '../schemas/service';

import { localizedServiceName, searchServices, suggestedServices } from './dashboard-search';

const svc = (over: Partial<Service> & { id: number }): Service => ({
  nameEn: '',
  nameAr: '',
  isCategory: false,
  ...over,
});

describe('localizedServiceName', () => {
  it('picks Arabic in ar, English in en (via LOCALE_DIRECTION, not locale === "ar")', () => {
    const s = svc({ id: 1, nameEn: 'Construction', nameAr: 'البناء' });
    expect(localizedServiceName(s, 'ar')).toBe('البناء');
    expect(localizedServiceName(s, 'en')).toBe('Construction');
  });

  it('falls back to the other locale when the primary side is blank', () => {
    expect(localizedServiceName(svc({ id: 1, nameEn: 'Only EN' }), 'ar')).toBe('Only EN');
    expect(localizedServiceName(svc({ id: 1, nameAr: 'عربي فقط' }), 'en')).toBe('عربي فقط');
  });
});

describe('searchServices', () => {
  const services: Service[] = [
    svc({ id: 1, nameEn: 'Construction', isCategory: true }),
    svc({ id: 2, nameEn: 'Interior design', isCategory: true }),
    svc({ id: 3, nameEn: 'Finishing contractor', isCategory: false }),
    svc({ id: 4, nameEn: 'Demolition contractor', isCategory: false }),
  ];

  it('returns nothing for queries shorter than 2 characters', () => {
    expect(searchServices(services, 'c', 'en')).toEqual([]);
    expect(searchServices(services, ' ', 'en')).toEqual([]);
  });

  it('matches case-insensitively as a substring', () => {
    const ids = searchServices(services, 'CONT', 'en').map((m) => m.service.id);
    expect(ids).toContain(3); // "Finishing contractor"
    expect(ids).toContain(4); // "Demolition contractor"
  });

  it('ranks a prefix match above a mid-string / word-start match', () => {
    const result = searchServices(services, 'con', 'en');
    // "Construction" (prefix, category) outranks "...contractor" (word-start)
    expect(result.map((m) => m.service.id)[0]).toBe(1);
    const scores = result.map((m) => m.score);
    expect(scores[0] ?? 0).toBeGreaterThan(scores[1] ?? 0);
  });

  it('splits the name into highlight parts around the match', () => {
    const matches = searchServices([svc({ id: 9, nameEn: 'Finishing contractor' })], 'contr', 'en');
    expect(matches).toHaveLength(1);
    const parts = matches[0]?.parts ?? [];
    expect(parts).toEqual([
      { text: 'Finishing ', match: false },
      { text: 'contr', match: true },
      { text: 'actor', match: false },
    ]);
    expect(parts.map((p) => p.text).join('')).toBe('Finishing contractor');
  });

  it('normalises Arabic alef / yaa / taa-marbuta variants', () => {
    const arServices = [svc({ id: 1, nameAr: 'مقاول هدم' })];
    // query uses ة (taa marbuta) where the name uses ه — still matches
    expect(searchServices(arServices, 'مقاول', 'ar')).toHaveLength(1);
    expect(searchServices([svc({ id: 2, nameAr: 'مهندس معماري' })], 'معمارى', 'ar')).toHaveLength(
      1,
    );
  });

  it('skips inactive services and honours the limit', () => {
    const many = [
      svc({ id: 1, nameEn: 'contractor a', isActive: false }),
      svc({ id: 2, nameEn: 'contractor b' }),
      svc({ id: 3, nameEn: 'contractor c' }),
    ];
    const result = searchServices(many, 'contractor', 'en', 1);
    expect(result).toHaveLength(1);
    expect(result.every((m) => m.service.isActive !== false)).toBe(true);
  });
});

describe('suggestedServices', () => {
  const services: Service[] = [
    svc({ id: 1, nameEn: 'B', isCategory: true, displayOrder: 2 }),
    svc({ id: 2, nameEn: 'A', isCategory: true, displayOrder: 1 }),
    svc({ id: 3, nameEn: 'Sub', isCategory: false, displayOrder: 0 }),
    svc({ id: 4, nameEn: 'Inactive', isCategory: true, isActive: false }),
  ];

  it('returns only active categories, ordered by displayOrder, capped at the limit', () => {
    const result = suggestedServices(services, 'en', 5);
    expect(result.map((s) => s.id)).toEqual([2, 1]); // subcategory + inactive excluded, order by displayOrder
  });

  it('honours the limit', () => {
    expect(suggestedServices(services, 'en', 1).map((s) => s.id)).toEqual([2]);
  });
});
