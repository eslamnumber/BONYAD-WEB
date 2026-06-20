import { beforeAll, describe, expect, it } from 'vitest';

import { i18n } from '@/lib/i18n';

import {
  defaultCreateProjectValues,
  type CreateProjectFormValues,
} from '../schemas/create-project-form';

import { buildReviewSections, type ReviewSection, type Translate } from './review-sections';

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

const t: Translate = (key, options) => i18n.t(key, options) as string;

function sectionsFor(overrides: Partial<CreateProjectFormValues>, categoryName?: string) {
  const values = { ...defaultCreateProjectValues(), ...overrides };
  const sections = buildReviewSections({ values, categoryName, t });
  return (id: string): ReviewSection => sections.find((s) => s.id === id) as ReviewSection;
}

describe('buildReviewSections', () => {
  it('maps filled values into five localized cards in order', () => {
    const get = sectionsFor({
      projectName: 'Mobile app UI',
      description: 'Need a designer',
      budget: '5,000',
      timelineWeeks: '8',
      deliverables: 'Figma + PDF',
      regionName: 'Riyadh',
      bidDeadline: '2025-08-01',
    });
    const budget = get('budget');
    expect(budget.rows[0]?.value).toBe('5,000'); // amount only — the Riyal glyph is rendered
    expect(budget.rows[0]?.currency).toBe(true);
    expect(budget.rows[1]?.value).toBe('8 weeks');
    expect(budget.editStep).toBe(1);

    const assignment = get('assignment');
    expect(assignment.rows[0]?.value).toBe('Receive offers');
    expect(assignment.rows[1]?.value).toBe('01/08/2025'); // yyyy-mm-dd → dd/mm/yyyy
    expect(assignment.rows[2]?.value).toBe('Riyadh');
    expect(assignment.editStep).toBe(4);
  });

  it('falls back to no-budget copy and "Not specified" for empty optionals', () => {
    const get = sectionsFor({ projectName: 'X', description: 'Y', noBudget: true }, undefined);
    expect(get('budget').rows[0]?.value).toBe('No specified budget');
    expect(get('budget').rows[0]?.currency).toBeUndefined();
    expect(get('info').rows[1]?.value).toBe('Not specified'); // category unresolved
    const deliverables = get('deliverables');
    expect(deliverables.rows).toHaveLength(1);
    expect(deliverables.rows[0]?.label).toBeUndefined();
    expect(deliverables.rows[0]?.value).toBe('Not specified');
    expect(get('phases').rows[0]?.value).toBe('Not specified'); // default single empty phase
  });

  it('names the technician on direct assignment', () => {
    const get = sectionsFor({
      projectName: 'X',
      description: 'Y',
      assignmentType: 'DIRECT_ASSIGNMENT',
      assignedTechnicianId: 7,
      assignedTechnicianName: 'خالد',
    });
    expect(get('assignment').rows[0]?.value).toBe('Direct assignment — خالد');
  });

  it('lists each filled phase with its duration and amount', () => {
    const get = sectionsFor({
      projectName: 'X',
      description: 'Y',
      phases: [{ name: 'Requirements', durationWeeks: '2', amount: '1,500', description: '' }],
    });
    const phases = get('phases');
    expect(phases.rows).toHaveLength(1);
    expect(phases.rows[0]?.label).toBe('Phase 1:');
    expect(phases.rows[0]?.value).toBe('Requirements — 2 weeks — 1,500'); // glyph rendered after
    expect(phases.rows[0]?.currency).toBe(true);
  });
});
