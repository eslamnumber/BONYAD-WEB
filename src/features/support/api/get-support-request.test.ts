import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getSupportRequest } from './get-support-request';

describe('getSupportRequest', () => {
  it('requests the :requestId path and returns the detail', async () => {
    let path = '';
    server.use(
      http.get('*/support/requests/:id', ({ params, request }) => {
        path = new URL(request.url).pathname;
        return HttpResponse.json({
          id: Number(params.id),
          subject: 'Refund',
          status: 'ASSIGNED',
          requesterName: 'Sara',
          assignedAdminName: 'Admin Noor',
        });
      }),
    );

    const detail = await getSupportRequest(7);
    expect(path.endsWith('/support/requests/7')).toBe(true);
    expect(detail.id).toBe(7);
    expect(detail.assignedAdminName).toBe('Admin Noor');
    expect(detail.requesterName).toBe('Sara');
  });

  it('throws ApiError with localized messages on 404', async () => {
    server.use(
      http.get('*/support/requests/:id', () =>
        HttpResponse.json(
          { messageEn: 'Not found.', messageAr: 'غير موجود.', errorCode: 'NOT_FOUND' },
          { status: 404 },
        ),
      ),
    );
    const err = await getSupportRequest(999).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(404);
    expect((err as ApiError).localizedMessage('ar')).toBe('غير موجود.');
  });
});
