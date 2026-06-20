import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '@/testing/handlers/server';

import { createPhasesFromSow, milestoneToPhase } from './create-phase';
import type { SowDocument } from './sow-types';

describe('milestoneToPhase', () => {
  it('maps week→days (min 1) and payment percent of grand_total.min→moneySpent', () => {
    expect(
      milestoneToPhase(7, { name: 'الأساسات', week: 4, payment_percent: 25 }, 1, 80000),
    ).toEqual({
      projectId: 7,
      phaseNumber: 1,
      description: 'الأساسات',
      timeSpentDays: 28,
      moneySpent: 20000,
    });
  });
});

describe('createPhasesFromSow', () => {
  const SOW: SowDocument = {
    timeline: {
      milestones: [
        { name: 'B', week: 2, payment_percent: 50 },
        { name: 'A', week: 1, payment_percent: 50 },
      ],
    },
    commercials: { cost_breakdown: { grand_total: { min: 1000 } } },
  };

  it('posts one phase per milestone (sorted by week), best-effort', async () => {
    const seen: number[] = [];
    server.use(
      http.post('*/phases', async ({ request }) => {
        const body = (await request.json()) as { phaseNumber: number; description: string };
        seen.push(body.phaseNumber);
        // first call fails — must not abort the rest
        return body.description === 'A'
          ? new HttpResponse(null, { status: 500 })
          : HttpResponse.json({ id: 1 });
      }),
    );

    const created = await createPhasesFromSow(7, SOW);
    expect(seen).toEqual([1, 2]); // sorted by week: A (week 1) then B (week 2)
    expect(created).toBe(1); // only the second succeeded
  });
});
