import { describe, expect, it } from 'vitest';

import type { Project } from '../../schemas/project';

import { isAiGenerated, parseProjectSow } from './parse-project-sow';

const base: Project = { id: 1 };

describe('isAiGenerated', () => {
  it('is true when any AI signal is present, false for manual projects', () => {
    expect(isAiGenerated(base)).toBe(false);
    expect(isAiGenerated({ ...base, aiGenerated: true })).toBe(true);
    expect(isAiGenerated({ ...base, hasSow: true })).toBe(true);
    expect(isAiGenerated({ ...base, sowJsonSnapshot: '{"scope":{}}' })).toBe(true);
    expect(isAiGenerated({ ...base, sowJsonSnapshot: '   ' })).toBe(false);
  });
});

describe('parseProjectSow', () => {
  it('returns null for a manual project', () => {
    expect(parseProjectSow(base)).toBeNull();
  });

  it('prefers the full snapshot (source of truth)', () => {
    const snapshot = JSON.stringify({
      project_metadata: { project_name: 'تشطيب شقة' },
      deliverables: [{ name: 'X' }],
    });
    const sow = parseProjectSow({ ...base, aiGenerated: true, sowJsonSnapshot: snapshot });
    expect(sow?.project_metadata?.project_name).toBe('تشطيب شقة');
    expect(sow?.deliverables).toEqual([{ name: 'X' }]);
  });

  it('reconstructs from flat columns when no snapshot', () => {
    const sow = parseProjectSow({
      ...base,
      hasSow: true,
      sowScope: '{"in_scope":["a","b"]}',
      sowKpis: '[{"metric":"الوقت","target":"10 أسابيع"}]',
      sowProjectType: 'تشطيب',
      sowQualityTier: 'A',
      sowCity: 'الرياض',
      sowEstimatedBudget: 80000,
      sowCurrency: 'SAR',
      sowDurationMonths: 2,
    });
    expect(sow).not.toBeNull();
    if (!sow) return;
    expect(sow.scope).toEqual({ in_scope: ['a', 'b'] });
    expect(sow.kpis).toEqual([{ metric: 'الوقت', target: '10 أسابيع' }]);
    expect(sow.project_metadata).toEqual({
      project_type: 'تشطيب',
      quality_tier: 'A',
      location: { city: 'الرياض' },
    });
    expect(sow.commercials).toEqual({
      currency: 'SAR',
      cost_breakdown: { grand_total: { min: 80000, max: 80000 } },
    });
    expect(sow.timeline).toEqual({ duration_weeks: 9 });
  });

  it('returns null when flagged AI but no usable data', () => {
    expect(parseProjectSow({ ...base, aiGenerated: true })).toBeNull();
  });
});
