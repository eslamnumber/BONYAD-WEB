import { describe, expect, it } from 'vitest';

import { emptyProjectForm, type ProjectFormValues, projectFormSchema } from './portfolio-form';

/** Local `YYYY-MM-DD` offset from today by `days` (negative = past, positive = future). */
function isoOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

function parse(overrides: Partial<ProjectFormValues>) {
  return projectFormSchema.safeParse({ ...emptyProjectForm, title: 'Villa', ...overrides });
}

/** Message of the first issue at the given field path, or undefined when valid. */
function messageAt(result: ReturnType<typeof parse>, field: string): string | undefined {
  if (result.success) return undefined;
  return result.error.issues.find((issue) => issue.path[0] === field)?.message;
}

describe('projectFormSchema', () => {
  it('accepts a minimal valid project (title only)', () => {
    expect(parse({}).success).toBe(true);
  });

  it('requires a title', () => {
    expect(messageAt(parse({ title: '' }), 'title')).toBe('portfolio.errors.titleRequired');
  });

  it('rejects an over-long title', () => {
    expect(messageAt(parse({ title: 'x'.repeat(121) }), 'title')).toBe(
      'portfolio.errors.titleTooLong',
    );
  });

  it('rejects an over-long description', () => {
    expect(messageAt(parse({ description: 'x'.repeat(1001) }), 'description')).toBe(
      'portfolio.errors.descriptionTooLong',
    );
  });

  describe('dates', () => {
    it('rejects a start date in the future', () => {
      expect(messageAt(parse({ startDate: isoOffset(1) }), 'startDate')).toBe(
        'portfolio.errors.startInFuture',
      );
    });

    it('rejects an end date in the future', () => {
      expect(messageAt(parse({ endDate: isoOffset(1) }), 'endDate')).toBe(
        'portfolio.errors.endInFuture',
      );
    });

    it('rejects an end date before the start date', () => {
      const result = parse({ startDate: isoOffset(-2), endDate: isoOffset(-5) });
      expect(messageAt(result, 'endDate')).toBe('portfolio.errors.endBeforeStart');
    });

    it('accepts a same-day start and end', () => {
      expect(parse({ startDate: isoOffset(-3), endDate: isoOffset(-3) }).success).toBe(true);
    });

    it('accepts a valid past date range', () => {
      expect(parse({ startDate: isoOffset(-30), endDate: isoOffset(-3) }).success).toBe(true);
    });

    it('accepts today as an endpoint', () => {
      expect(parse({ startDate: isoOffset(0), endDate: isoOffset(0) }).success).toBe(true);
    });
  });

  describe('project value', () => {
    it.each(['abc', '0', '-5'])('rejects a non-positive / non-numeric value: %s', (value) => {
      expect(messageAt(parse({ projectValue: value }), 'projectValue')).toBe(
        'portfolio.errors.valueInvalid',
      );
    });

    it('accepts a positive value', () => {
      expect(parse({ projectValue: '15000' }).success).toBe(true);
    });

    it('treats an empty value as valid (optional)', () => {
      expect(parse({ projectValue: '' }).success).toBe(true);
    });
  });
});
