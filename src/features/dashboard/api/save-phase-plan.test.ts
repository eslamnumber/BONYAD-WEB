import { http, HttpResponse, type PathParams } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { type PhasePlanSaveInput } from '../schemas/phase-plan';

import { savePhasePlan } from './save-phase-plan';

type Call = { method: string; path: string; body: Record<string, unknown> | null };

/** Record every /phases write so a test can assert method + path + body. */
function recordPhaseWrites(): Call[] {
  const calls: Call[] = [];
  const capture = async ({ request, params }: { request: Request; params: PathParams }) => {
    const body =
      request.method === 'DELETE' ? null : ((await request.json()) as Record<string, unknown>);
    const phaseId = typeof params.phaseId === 'string' ? params.phaseId : '';
    calls.push({ method: request.method, path: phaseId, body });
    return HttpResponse.json({ ok: true });
  };
  server.use(
    http.post('*/phases', capture),
    http.put('*/phases/:phaseId', capture),
    http.delete('*/phases/:phaseId', capture),
  );
  return calls;
}

describe('savePhasePlan', () => {
  it('deletes removed phases, PUTs survivors with the full body, then POSTs new ones', async () => {
    const calls = recordPhaseWrites();
    const input: PhasePlanSaveInput = {
      deletes: [9],
      updates: [
        {
          id: 5,
          phaseNumber: 1,
          description: 'Foundations',
          timeSpentDays: 21,
          moneySpent: 100000,
        },
      ],
      creates: [{ phaseNumber: 2, description: 'Finishing', timeSpentDays: 14, moneySpent: 50000 }],
    };

    await expect(savePhasePlan(42, input)).resolves.toBeUndefined();

    // Order matches the iOS submit: delete → update → create.
    expect(calls.map((c) => c.method)).toEqual(['DELETE', 'PUT', 'POST']);
    expect(calls[0]).toMatchObject({ method: 'DELETE', path: '9' });
    // Survivor: full write body, projectId attached, no `id`/`title`.
    expect(calls[1]).toMatchObject({ method: 'PUT', path: '5' });
    expect(calls[1]!.body).toEqual({
      projectId: 42,
      phaseNumber: 1,
      description: 'Foundations',
      timeSpentDays: 21,
      moneySpent: 100000,
    });
    expect(calls[1]!.body).not.toHaveProperty('id');
    // New phase: POST /phases with the attached projectId.
    expect(calls[2]).toMatchObject({
      method: 'POST',
      body: {
        projectId: 42,
        phaseNumber: 2,
        description: 'Finishing',
        timeSpentDays: 14,
        moneySpent: 50000,
      },
    });
  });

  it('is a no-op when nothing changed (no writes issued)', async () => {
    const calls = recordPhaseWrites();
    await savePhasePlan(42, { updates: [], creates: [], deletes: [] });
    expect(calls).toHaveLength(0);
  });

  it('throws ApiError when a phase write is rejected', async () => {
    server.use(
      http.put('*/phases/:phaseId', () =>
        HttpResponse.json({ messageEn: 'Phase can no longer be edited.' }, { status: 409 }),
      ),
    );
    const input: PhasePlanSaveInput = {
      deletes: [],
      updates: [
        {
          id: 5,
          phaseNumber: 1,
          description: 'Foundations',
          timeSpentDays: 21,
          moneySpent: 100000,
        },
      ],
      creates: [],
    };
    const err = await savePhasePlan(42, input).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(409);
  });
});
