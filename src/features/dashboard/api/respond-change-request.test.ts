import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { respondChangeRequest } from './respond-change-request';

describe('respondChangeRequest', () => {
  it('POSTs the reply to the right id and returns RESPONDED', async () => {
    let sent: Record<string, unknown> = {};
    let calledPath = '';
    server.use(
      http.post('*/change-requests/:id/respond', async ({ request, params }) => {
        sent = (await request.json()) as Record<string, unknown>;
        calledPath = String(params.id);
        return HttpResponse.json({ message: 'ok', changeRequestId: 101, status: 'RESPONDED' });
      }),
    );

    const res = await respondChangeRequest({
      projectId: 183,
      changeRequestId: 101,
      input: { response: "Let's meet in the middle at 1200." },
    });

    expect(res.status).toBe('RESPONDED');
    expect(calledPath).toBe('101');
    expect(sent.response).toBe("Let's meet in the middle at 1200.");
  });

  it('rejects an empty reply before any network call (zod)', async () => {
    await expect(
      respondChangeRequest({ projectId: 183, changeRequestId: 101, input: { response: '' } }),
    ).rejects.toBeTruthy();
  });

  it('throws ApiError on a 409', async () => {
    server.use(
      http.post('*/change-requests/:id/respond', () =>
        HttpResponse.json({ messageEn: 'Already resolved.' }, { status: 409 }),
      ),
    );
    const err = await respondChangeRequest({
      projectId: 183,
      changeRequestId: 101,
      input: { response: 'x' },
    }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(409);
  });
});
