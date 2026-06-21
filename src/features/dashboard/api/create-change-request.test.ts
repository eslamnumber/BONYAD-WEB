import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { createChangeRequest } from './create-change-request';

describe('createChangeRequest', () => {
  it('POSTs the validated body (description + budget + phaseChanges) and returns the response', async () => {
    let sent: Record<string, unknown> = {};
    server.use(
      http.post('*/change-requests/project/:projectId/request', async ({ request }) => {
        sent = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(
          { message: 'ok', changeRequestId: 102, status: 'PENDING' },
          { status: 201 },
        );
      }),
    );

    const res = await createChangeRequest({
      projectId: 183,
      input: {
        description: 'Add waterproofing',
        newBudget: 1500,
        phaseChanges: [
          {
            actionType: 'CREATE',
            description: 'Waterproofing',
            timeSpentDays: 5,
            moneySpent: 1500,
          },
          { actionType: 'DELETE', phaseId: 274 },
        ],
      },
    });

    expect(res.changeRequestId).toBe(102);
    expect(sent.description).toBe('Add waterproofing');
    expect(sent.newBudget).toBe(1500);
    expect(Array.isArray(sent.phaseChanges)).toBe(true);
  });

  it('rejects an empty description before any network call (zod)', async () => {
    await expect(
      createChangeRequest({ projectId: 183, input: { description: '  ' } }),
    ).rejects.toBeTruthy();
  });

  it('rejects a CREATE phaseChange missing required fields (discriminated union)', async () => {
    await expect(
      createChangeRequest({
        projectId: 183,
        input: {
          description: 'x',
          // @ts-expect-error — CREATE requires description/time/money; this is the invalid case under test
          phaseChanges: [{ actionType: 'CREATE', moneySpent: 10 }],
        },
      }),
    ).rejects.toBeTruthy();
  });

  it('throws ApiError with localized messages on 400', async () => {
    server.use(
      http.post('*/change-requests/project/:projectId/request', () =>
        HttpResponse.json(
          {
            messageEn: 'Project not in progress.',
            messageAr: 'المشروع غير قيد التنفيذ.',
            errorCode: 'INVALID_STATE',
          },
          { status: 400 },
        ),
      ),
    );
    const err = await createChangeRequest({
      projectId: 183,
      input: { description: 'x' },
    }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).errorCode).toBe('INVALID_STATE');
    expect((err as ApiError).localizedMessage('ar')).toBe('المشروع غير قيد التنفيذ.');
  });
});
