import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { agreeChangeRequest } from './agree-change-request';

describe('agreeChangeRequest', () => {
  it('defaults signingMethod to EMAIL and returns the two-party agreement payload', async () => {
    let sent: Record<string, unknown> = {};
    server.use(
      http.post('*/change-requests/:id/agree', async ({ request }) => {
        sent = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          message: 'ok',
          userAgreed: true,
          technicianAgreed: false,
          bothAgreed: false,
        });
      }),
    );

    const res = await agreeChangeRequest({ projectId: 183, changeRequestId: 101 });
    expect(sent.signingMethod).toBe('EMAIL');
    expect(res.userAgreed).toBe(true);
    expect(res.bothAgreed).toBe(false);
  });

  it('surfaces a signed documentUrl once both parties agree', async () => {
    server.use(
      http.post('*/change-requests/:id/agree', () =>
        HttpResponse.json({
          userAgreed: true,
          technicianAgreed: true,
          bothAgreed: true,
          documentUrl: 'https://files.test/cr-101.pdf',
        }),
      ),
    );
    const res = await agreeChangeRequest({
      projectId: 183,
      changeRequestId: 101,
      input: { agreedChanges: 'Final terms', signingMethod: 'EMAIL' },
    });
    expect(res.bothAgreed).toBe(true);
    expect(res.documentUrl).toContain('cr-101.pdf');
  });

  it('throws ApiError on a 400', async () => {
    server.use(
      http.post('*/change-requests/:id/agree', () =>
        HttpResponse.json({ messageEn: 'Cannot agree.' }, { status: 400 }),
      ),
    );
    const err = await agreeChangeRequest({ projectId: 183, changeRequestId: 101 }).catch(
      (e: unknown) => e,
    );
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(400);
  });
});
