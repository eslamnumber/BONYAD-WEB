import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { buildPhaseRequests } from '../lib/create-project-mapping';

import { createPhase, createPhasesForProject } from './create-phases';

const PHASES = [
  { name: 'الأساسات', durationWeeks: '2', amount: '5,000', description: 'حفر' },
  { name: '', durationWeeks: '', amount: '', description: '' }, // dropped
  { name: 'التشطيب', durationWeeks: '', amount: '', description: 'دهان' },
];

/** Capture every JSON phase body posted to /phases. */
function capturePhases() {
  const bodies: Record<string, unknown>[] = [];
  server.use(
    http.post('*/phases', async ({ request }) => {
      bodies.push((await request.json()) as Record<string, unknown>);
      return HttpResponse.json({ id: bodies.length });
    }),
  );
  return bodies;
}

describe('buildPhaseRequests', () => {
  it('drops empty rows, renumbers 1..n, converts weeks→days, parses amount', () => {
    expect(buildPhaseRequests(7, PHASES)).toEqual([
      {
        projectId: 7,
        phaseNumber: 1,
        title: 'الأساسات',
        description: 'حفر',
        timeSpentDays: 14,
        moneySpent: 5000,
      },
      { projectId: 7, phaseNumber: 2, title: 'التشطيب', description: 'دهان', timeSpentDays: 7 },
    ]);
  });
});

describe('createPhase', () => {
  it('posts a JSON phase body', async () => {
    const bodies = capturePhases();
    await createPhase({
      projectId: 5,
      phaseNumber: 1,
      title: 'الأساسات',
      description: 'وصف',
      timeSpentDays: 14,
      moneySpent: 5000,
    });
    expect(bodies[0]).toEqual({
      projectId: 5,
      phaseNumber: 1,
      title: 'الأساسات',
      description: 'وصف',
      timeSpentDays: 14,
      moneySpent: 5000,
    });
  });

  it('throws ApiError on 400', async () => {
    server.use(
      http.post('*/phases', () =>
        HttpResponse.json({ messageEn: 'Bad phase.', errorCode: 'X' }, { status: 400 }),
      ),
    );
    const err = await createPhase({ projectId: 1, phaseNumber: 1, title: 'x' }).catch(
      (e: unknown) => e,
    );
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(400);
  });
});

describe('createPhasesForProject', () => {
  it('posts one phase per non-empty row, in order', async () => {
    const bodies = capturePhases();
    await createPhasesForProject(7, PHASES);
    expect(bodies).toHaveLength(2);
    expect(bodies.map((b) => b.phaseNumber)).toEqual([1, 2]);
    expect(bodies.every((b) => b.projectId === 7)).toBe(true);
  });

  it('swallows a failing phase POST', async () => {
    server.use(http.post('*/phases', () => HttpResponse.json({}, { status: 500 })));
    await expect(createPhasesForProject(7, PHASES)).resolves.toBeUndefined();
  });
});
