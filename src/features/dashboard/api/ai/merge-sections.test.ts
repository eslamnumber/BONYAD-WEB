import { describe, expect, it } from 'vitest';

import { countSowSections, mergeSection } from './merge-sections';

describe('mergeSection', () => {
  it('sets a top-level section immutably', () => {
    const base = {};
    const next = mergeSection(base, 'scope', { in_scope: ['a'] });
    expect(next.scope).toEqual({ in_scope: ['a'] });
    expect(base).toEqual({});
  });

  it('sets a nested dotted path, creating intermediate objects', () => {
    const next = mergeSection({}, 'commercials.cost_breakdown', {
      grand_total: { min: 1, max: 2 },
    });
    expect(next.commercials?.cost_breakdown?.grand_total).toEqual({ min: 1, max: 2 });
  });

  it('ignores an empty path', () => {
    expect(mergeSection({ scope: {} }, '', { x: 1 })).toEqual({ scope: {} });
  });
});

describe('countSowSections', () => {
  it('counts only top-level sections that carry content', () => {
    expect(
      countSowSections({
        project_metadata: { project_name: 'x' },
        scope: {},
        deliverables: [],
        risks: [{ description: 'r' }],
      }),
    ).toBe(2);
    expect(countSowSections({})).toBe(0);
  });
});
